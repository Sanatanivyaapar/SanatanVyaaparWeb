// Static data for businesses
const businessData = [
    {
        id: 1,
        businessName: "श्री कृष्णा किराना स्टोर",
        ownerName: "रमेश भाई पटेल",
        category: "किराना",
        district: "अहमदाबाद",
        pincode: "380001",
        phone: "9876543210",
        whatsapp: "9876543210",
        email: "krishnastore@example.com",
        address: "रामनगर, अहमदाबाद",
        description: "सभी प्रकार का किराना सामान उपलब्ध। स्पेशल छूट नियमित ग्राहकों के लिए।",
        image: "images/kirana-store.jpg",
        featured: true
    },
    {
        id: 2,
        businessName: "ओम ज्वेलर्स",
        ownerName: "महेश भाई शाह",
        category: "ज्वेलरी",
        district: "सूरत",
        pincode: "395001",
        phone: "9876543211",
        whatsapp: "9876543211",
        email: "omjewellers@example.com",
        address: "वराच्छा, सूरत",
        description: "सोने-चांदी की असली ज्वेलरी की विस्तृत रेंज। विशेष डिज़ाइन उपलब्ध।",
        image: "images/jewelry.jpg",
        featured: false
    },
    {
        id: 3,
        businessName: "शुभ लाभ ट्रैवल्स",
        ownerName: "अमित भाई पटेल",
        category: "ट्रैवल",
        district: "वडोदरा",
        pincode: "390001",
        phone: "9876543212",
        whatsapp: "9876543212",
        email: "shubhlabhtravels@example.com",
        address: "अलकापुरी, वडोदरा",
        description: "सभी प्रकार के टूर पैकेज उपलब्ध। हवाई, रेल और बस बुकिंग की सुविधा।",
        image: "images/travel.jpg",
        featured: true
    },
    {
        id: 4,
        businessName: "गणपति क्लीनर्स",
        ownerName: "संजय भाई शर्मा",
        category: "ड्राई क्लीनिंग",
        district: "राजकोट",
        pincode: "360001",
        phone: "9876543213",
        whatsapp: "9876543213",
        email: "ganapaticleaners@example.com",
        address: "कलावड रोड, राजकोट",
        description: "बेस्ट क्वालिटी ड्राई क्लीनिंग सर्विस। होम डिलीवरी उपलब्ध।",
        image: "images/dryclean.jpg",
        featured: false
    },
    {
        id: 5,
        businessName: "शिव शक्ति इलेक्ट्रॉनिक्स",
        ownerName: "विकास भाई मेहता",
        category: "इलेक्ट्रॉनिक्स",
        district: "भावनगर",
        pincode: "364001",
        phone: "9876543214",
        whatsapp: "9876543214",
        email: "shivshaktielectronics@example.com",
        address: "कृष्णनगर, भावनगर",
        description: "सभी प्रकार के इलेक्ट्रॉनिक सामान की मरम्मत और सेल। आधिकारिक सर्विस सेंटर।",
        image: "images/electronics.jpg",
        featured: true
    }
{
    id: 6,
    businessName: "दीपज्योत प्राकृतिक फार्म",
    ownerName: "दीपक पटेल",
    category: "उत्पादन कर्ता, प्राकृतिक फार्म" ,
    district: "सूरत",
    pincode: "394540",
    phone: "9825114688",
    whatsapp: "व्हाट्सएप नंबर",
    email: "ईमेल",
    address: "पूरा पता",
    description: "विवरण",
    image: "images/your-image.jpg",
    featured: true/false
}


// Function to get all businesses
function getAllBusinesses() {
    return businessData;
}

// Function to get featured businesses
function getFeaturedBusinesses() {
    return businessData.filter(business => business.featured);
}

// Function to get businesses by category
function getBusinessesByCategory(category) {
    return businessData.filter(business => business.category === category);
}

// Function to get businesses by district
function getBusinessesByDistrict(district) {
    return businessData.filter(business => business.district === district);
}

// Function to get businesses by pincode
function getBusinessesByPincode(pincode) {
    return businessData.filter(business => business.pincode === pincode);
}

// Function to search businesses
function searchBusinesses(query) {
    const searchTerm = query.toLowerCase();
    return businessData.filter(business => 
        business.businessName.toLowerCase().includes(searchTerm) ||
        business.ownerName.toLowerCase().includes(searchTerm) ||
        business.description.toLowerCase().includes(searchTerm)
    );
}

// Export functions
window.businessDataService = {
    getAllBusinesses,
    getFeaturedBusinesses,
    getBusinessesByCategory,
    getBusinessesByDistrict,
    getBusinessesByPincode,
    searchBusinesses
};
