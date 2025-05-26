#!/usr/bin/env python3
"""
Keval Sanatani Vyapar Website Server
A comprehensive server for Sanatani business directory with database integration
"""

import os
import sys
import http.server
import socketserver
import urllib.parse
import mimetypes
import json
import re
from pathlib import Path
from datetime import datetime
import threading
import time
import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor

# Server configuration
PORT = 5000
HOST = '0.0.0.0'
BASE_DIR = Path(__file__).parent

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
DB_HOST = os.getenv('PGHOST', 'localhost')
DB_PORT = os.getenv('PGPORT', '5432')
DB_NAME = os.getenv('PGDATABASE', 'postgres')
DB_USER = os.getenv('PGUSER', 'postgres')
DB_PASSWORD = os.getenv('PGPASSWORD', '')

# MIME types for better file serving
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/json', '.json')

# Database connection pool
db_pool = None

def init_database():
    """Initialize database connection pool"""
    global db_pool
    try:
        if DATABASE_URL:
            db_pool = psycopg2.pool.SimpleConnectionPool(
                1, 10, DATABASE_URL
            )
        else:
            db_pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
        print("✅ Database connection pool initialized")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

def get_db_connection():
    """Get database connection from pool"""
    if db_pool:
        return db_pool.getconn()
    return None

def return_db_connection(conn):
    """Return database connection to pool"""
    if db_pool and conn:
        db_pool.putconn(conn)

class SanatanVyaaparHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for the Sanatan Vyaapar website"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            # Parse the URL
            parsed_path = urllib.parse.urlparse(self.path)
            path = parsed_path.path
            
            # Handle API endpoints
            if path == '/api/businesses':
                self.handle_get_businesses()
                return
            
            # Handle root path - serve index.html
            if path == '/' or path == '':
                path = '/index.html'
            
            # Security check - prevent directory traversal
            if '..' in path or path.startswith('//'):
                self.send_error(404, "File not found")
                return
            
            # Construct file path
            file_path = BASE_DIR / path.lstrip('/')
            
            # Check if file exists
            if not file_path.exists():
                # Try to serve index.html for SPA routing
                if not path.endswith(('.html', '.css', '.js', '.svg', '.ico', '.png', '.jpg', '.jpeg', '.gif')):
                    file_path = BASE_DIR / 'index.html'
                    if not file_path.exists():
                        self.send_error(404, "File not found")
                        return
                else:
                    self.send_error(404, "File not found")
                    return
            
            # Check if it's a directory
            if file_path.is_dir():
                # Look for index.html in the directory
                index_file = file_path / 'index.html'
                if index_file.exists():
                    file_path = index_file
                else:
                    self.send_error(403, "Directory listing not allowed")
                    return
            
            # Read and serve the file
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                # Determine content type
                content_type = mimetypes.guess_type(str(file_path))[0] or 'application/octet-stream'
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                
                # Add cache headers for static assets
                if path.endswith(('.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico')):
                    self.send_header('Cache-Control', 'public, max-age=3600')
                else:
                    self.send_header('Cache-Control', 'no-cache')
                
                # CORS headers for development
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                
                self.end_headers()
                self.wfile.write(content)
                
                # Log the request
                self.log_request(200)
                
            except IOError as e:
                self.send_error(500, f"Internal server error: {str(e)}")
                
        except Exception as e:
            print(f"Error handling GET request: {str(e)}")
            self.send_error(500, "Internal server error")
    
    def do_POST(self):
        """Handle POST requests for form submissions and API calls"""
        try:
            parsed_path = urllib.parse.urlparse(self.path)
            path = parsed_path.path
            
            # Handle business registration
            if path == '/api/businesses':
                self.handle_business_registration()
            # Handle contact form submission
            elif path == '/api/contact' or path == '/contact':
                self.handle_contact_form()
            # Handle newsletter subscription
            elif path == '/api/newsletter' or path == '/newsletter':
                self.handle_newsletter_subscription()
            else:
                self.send_error(404, "Endpoint not found")
                
        except Exception as e:
            print(f"Error handling POST request: {str(e)}")
            self.send_error(500, "Internal server error")
    
    def handle_get_businesses(self):
        """Handle GET request for businesses API"""
        try:
            conn = get_db_connection()
            if not conn:
                self.send_json_response(500, {'error': 'Database connection failed'})
                return
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT id, sanatani_id, business_name, owner_name, business_type, 
                       category, district, state, pincode, address, whatsapp, 
                       phone, email, website, description, business_image, 
                       status, featured, created_at
                FROM businesses 
                WHERE status = 'approved'
                ORDER BY featured DESC, created_at DESC
            """)
            
            businesses = []
            for row in cursor.fetchall():
                business = dict(row)
                # Convert datetime to string for JSON serialization
                if business.get('created_at'):
                    business['created_at'] = business['created_at'].isoformat()
                businesses.append(business)
            
            cursor.close()
            return_db_connection(conn)
            
            self.send_json_response(200, {'businesses': businesses})
            
        except Exception as e:
            print(f"Error fetching businesses: {str(e)}")
            try:
                if 'conn' in locals() and conn:
                    return_db_connection(conn)
            except:
                pass
            self.send_json_response(500, {'error': 'Failed to fetch businesses'})
    
    def handle_business_registration(self):
        """Handle business registration"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            if self.headers.get('Content-Type', '').startswith('application/json'):
                form_data = json.loads(post_data.decode('utf-8'))
            else:
                form_data = urllib.parse.parse_qs(post_data.decode('utf-8'))
                form_data = {k: v[0] if isinstance(v, list) and len(v) == 1 else v 
                           for k, v in form_data.items()}
            
            # Validate required fields
            required_fields = ['businessName', 'ownerName', 'businessType', 'category', 
                             'district', 'state', 'pincode', 'whatsapp', 'address']
            
            for field in required_fields:
                if not form_data.get(field):
                    self.send_json_response(400, {
                        'success': False,
                        'message': f'आवश्यक फील्ड गुम है: {field}'
                    })
                    return
            
            # Generate unique Sanatani ID
            conn = get_db_connection()
            if not conn:
                self.send_json_response(500, {'error': 'Database connection failed'})
                return
            
            cursor = conn.cursor()
            
            # Generate ID based on category
            category_prefix = {
                'खानपान': 'HOS',
                'वस्त्र': 'TEX', 
                'आभूषण': 'JEW',
                'पुस्तक': 'BOO',
                'आयुर्वेद': 'MED',
                'जैविक उत्पाद': 'FRU',
                'धार्मिक सामग्री': 'REL',
                'हस्तशिल्प': 'CRA'
            }
            
            prefix = category_prefix.get(form_data['category'], 'GEN')
            
            # Get next ID number
            cursor.execute("SELECT COUNT(*) FROM businesses WHERE sanatani_id LIKE %s", (f'SN-{prefix}-%',))
            count = cursor.fetchone()[0] + 1
            sanatani_id = f"SN-{prefix}-{count:04d}"
            
            # Insert new business
            cursor.execute("""
                INSERT INTO businesses (
                    sanatani_id, business_name, owner_name, business_type, category,
                    district, state, pincode, address, whatsapp, phone, email,
                    website, description, business_image, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                sanatani_id,
                form_data['businessName'],
                form_data['ownerName'], 
                form_data['businessType'],
                form_data['category'],
                form_data['district'],
                form_data['state'],
                form_data['pincode'],
                form_data['address'],
                form_data['whatsapp'],
                form_data.get('phone', ''),
                form_data.get('email', ''),
                form_data.get('website', ''),
                form_data.get('description', ''),
                form_data.get('businessImage', ''),
                'pending'
            ))
            
            conn.commit()
            cursor.close()
            return_db_connection(conn)
            
            self.send_json_response(200, {
                'success': True,
                'message': 'व्यापार सफलतापूर्वक पंजीकृत हो गया!',
                'sanatani_id': sanatani_id
            })
            
            print(f"New business registered: {sanatani_id} - {form_data['businessName']}")
            
        except Exception as e:
            print(f"Error registering business: {str(e)}")
            if 'conn' in locals():
                return_db_connection(conn)
            self.send_json_response(500, {
                'success': False,
                'message': 'पंजीकरण में समस्या हुई'
            })
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_contact_form(self):
        """Handle contact form submissions"""
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read POST data
            post_data = self.rfile.read(content_length)
            
            # Parse form data
            if self.headers.get('Content-Type', '').startswith('application/json'):
                form_data = json.loads(post_data.decode('utf-8'))
            else:
                form_data = urllib.parse.parse_qs(post_data.decode('utf-8'))
                # Convert lists to single values
                form_data = {k: v[0] if isinstance(v, list) and len(v) == 1 else v 
                           for k, v in form_data.items()}
            
            # Validate required fields
            required_fields = ['firstName', 'email', 'subject', 'message']
            missing_fields = [field for field in required_fields if not form_data.get(field)]
            
            if missing_fields:
                response = {
                    'success': False,
                    'message': f'आवश्यक फील्ड गुम हैं: {", ".join(missing_fields)}',
                    'missing_fields': missing_fields
                }
                self.send_json_response(400, response)
                return
            
            # Log the form submission (in a real app, you'd save to database or send email)
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log_entry = {
                'timestamp': timestamp,
                'type': 'contact_form',
                'data': form_data,
                'ip': self.client_address[0]
            }
            
            # Save to log file
            self.save_form_data('contact_submissions.log', log_entry)
            
            # Send success response
            response = {
                'success': True,
                'message': 'आपका संदेश सफलतापूर्वक भेज दिया गया है! हम जल्दी ही आपसे संपर्क करेंगे।',
                'submission_id': f"CONTACT_{int(time.time())}"
            }
            
            self.send_json_response(200, response)
            
            # Print to console for development
            print(f"[{timestamp}] Contact form submitted:")
            print(f"  Name: {form_data.get('firstName', '')} {form_data.get('lastName', '')}")
            print(f"  Email: {form_data.get('email', '')}")
            print(f"  Subject: {form_data.get('subject', '')}")
            print(f"  Company: {form_data.get('company', 'N/A')}")
            print(f"  Phone: {form_data.get('phone', 'N/A')}")
            print(f"  Message: {form_data.get('message', '')[:100]}...")
            
        except Exception as e:
            print(f"Error handling contact form: {str(e)}")
            response = {
                'success': False,
                'message': 'सर्वर में कोई समस्या हुई है। कृपया बाद में पुनः प्रयास करें।'
            }
            self.send_json_response(500, response)
    
    def handle_newsletter_subscription(self):
        """Handle newsletter subscription"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            if self.headers.get('Content-Type', '').startswith('application/json'):
                form_data = json.loads(post_data.decode('utf-8'))
            else:
                form_data = urllib.parse.parse_qs(post_data.decode('utf-8'))
                form_data = {k: v[0] if isinstance(v, list) and len(v) == 1 else v 
                           for k, v in form_data.items()}
            
            email_data = form_data.get('email', '')
            email = email_data[0] if isinstance(email_data, list) else email_data
            email = email.strip() if email else ''
            
            if not email:
                response = {
                    'success': False,
                    'message': 'ईमेल पता आवश्यक है।'
                }
                self.send_json_response(400, response)
                return
            
            # Basic email validation
            if '@' not in email or '.' not in email:
                response = {
                    'success': False,
                    'message': 'कृपया वैध ईमेल पता दर्ज करें।'
                }
                self.send_json_response(400, response)
                return
            
            # Log subscription
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log_entry = {
                'timestamp': timestamp,
                'type': 'newsletter_subscription',
                'email': email,
                'ip': self.client_address[0]
            }
            
            self.save_form_data('newsletter_subscriptions.log', log_entry)
            
            response = {
                'success': True,
                'message': 'न्यूज़लेटर की सदस्यता सफल हो गई! धन्यवाद।'
            }
            
            self.send_json_response(200, response)
            
            print(f"[{timestamp}] Newsletter subscription: {email}")
            
        except Exception as e:
            print(f"Error handling newsletter subscription: {str(e)}")
            response = {
                'success': False,
                'message': 'सर्वर में कोई समस्या हुई है। कृपया बाद में पुनः प्रयास करें।'
            }
            self.send_json_response(500, response)
    
    def send_json_response(self, status_code, data):
        """Send JSON response"""
        response_data = json.dumps(data, ensure_ascii=False, indent=2)
        response_bytes = response_data.encode('utf-8')
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)
    
    def save_form_data(self, filename, data):
        """Save form data to log file"""
        try:
            logs_dir = BASE_DIR / 'logs'
            logs_dir.mkdir(exist_ok=True)
            
            log_file = logs_dir / filename
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(data, ensure_ascii=False) + '\n')
                
        except Exception as e:
            print(f"Error saving form data: {str(e)}")
    
    def log_message(self, format, *args):
        """Custom log message format"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = format % args
        print(f"[{timestamp}] {self.client_address[0]} - {message}")
    
    def log_request(self, code='-', size='-'):
        """Log successful requests"""
        self.log_message('"%s" %s %s',
                        self.requestline, str(code), str(size))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Threaded HTTP server for handling multiple requests"""
    daemon_threads = True
    allow_reuse_address = True

def check_files():
    """Check if required files exist"""
    required_files = [
        'index.html',
        'styles/main.css',
        'styles/components.css',
        'scripts/main.js',
        'scripts/components.js'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not (BASE_DIR / file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("⚠️  चेतावनी: निम्नलिखित आवश्यक फाइलें गुम हैं:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        print()
    
    return len(missing_files) == 0

def print_server_info():
    """Print server startup information"""
    print("🕉️  सनातन व्यापार वेबसाइट सर्वर")
    print("=" * 50)
    print(f"📍 सर्वर पता: http://{HOST}:{PORT}")
    print(f"📁 बेस डायरेक्टरी: {BASE_DIR}")
    print(f"🕐 शुरुआत का समय: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("📋 उपलब्ध पृष्ठ:")
    print("   • मुख्य पृष्ठ: http://localhost:5000/")
    print("   • हमारे बारे में: http://localhost:5000/pages/about.html")
    print("   • सेवाएं: http://localhost:5000/pages/services.html")
    print("   • उत्पाद: http://localhost:5000/pages/products.html")
    print("   • संपर्क: http://localhost:5000/pages/contact.html")
    print()
    print("📡 API Endpoints:")
    print("   • Contact Form: POST /api/contact")
    print("   • Newsletter: POST /api/newsletter")
    print()
    print("सर्वर बंद करने के लिए Ctrl+C दबाएं")
    print("=" * 50)

def create_directories():
    """Create necessary directories"""
    directories = ['logs', 'assets']
    for directory in directories:
        (BASE_DIR / directory).mkdir(exist_ok=True)

def main():
    """Main server function"""
    try:
        # Initialize database
        if not init_database():
            print("❌ डेटाबेस कनेक्शन नहीं हो सका। कृपया डेटाबेस सेटिंग्स जांचें।")
            return 1
        
        # Create necessary directories
        create_directories()
        
        # Check for required files
        if not check_files():
            print("❌ कुछ आवश्यक फाइलें गुम हैं। कृपया सुनिश्चित करें कि सभी फाइलें मौजूद हैं।")
            return 1
        
        # Create and start the server
        with ThreadedHTTPServer((HOST, PORT), SanatanVyaaparHandler) as httpd:
            print_server_info()
            
            try:
                # Start the server
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n")
                print("🛑 सर्वर बंद किया जा रहा है...")
                httpd.shutdown()
                print("✅ सर्वर सफलतापूर्वक बंद हो गया। धन्यवाद!")
                return 0
                
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ त्रुटि: पोर्ट {PORT} पहले से उपयोग में है।")
            print("   कृपया दूसरा पोर्ट चुनें या चल रहे सर्वर को बंद करें।")
        else:
            print(f"❌ सर्वर त्रुटि: {str(e)}")
        return 1
    except Exception as e:
        print(f"❌ अनपेक्षित त्रुटि: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
