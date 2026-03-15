# Legal Aid Centers database for major Indian cities
# Source: NALSA (National Legal Services Authority)

LEGAL_AID_CENTERS = [
    {
        "name": "NALSA - National Legal Services Authority",
        "city": "New Delhi",
        "address": "12/11, Jam Nagar House, Shahjahan Road, New Delhi - 110011",
        "phone": "15100",
        "email": "nalsa@nic.in",
        "lat": 28.6139,
        "lng": 77.2090,
        "type": "national"
    },
    {
        "name": "DLSA - Bengaluru District Legal Services Authority",
        "city": "Bengaluru",
        "address": "City Civil Court Complex, Bangalore - 560001",
        "phone": "080-22971000",
        "email": "dlsa.bangalore@gmail.com",
        "lat": 12.9716,
        "lng": 77.5946,
        "type": "district"
    },
    {
        "name": "DLSA - Mumbai District Legal Services Authority",
        "city": "Mumbai",
        "address": "City Civil & Sessions Court, Kala Ghoda, Mumbai - 400032",
        "phone": "022-22620211",
        "email": "dlsa.mumbai@gmail.com",
        "lat": 18.9322,
        "lng": 72.8346,
        "type": "district"
    },
    {
        "name": "DLSA - Chennai District Legal Services Authority",
        "city": "Chennai",
        "address": "High Court Buildings, Chennai - 600104",
        "phone": "044-25340543",
        "email": "dlsa.chennai@gmail.com",
        "lat": 13.0827,
        "lng": 80.2707,
        "type": "district"
    },
    {
        "name": "DLSA - Hyderabad District Legal Services Authority",
        "city": "Hyderabad",
        "address": "City Civil Court, Nampally, Hyderabad - 500001",
        "phone": "040-24652374",
        "email": "dlsa.hyderabad@gmail.com",
        "lat": 17.3850,
        "lng": 78.4867,
        "type": "district"
    },
    {
        "name": "DLSA - Kolkata District Legal Services Authority",
        "city": "Kolkata",
        "address": "Calcutta High Court, Strand Road, Kolkata - 700001",
        "phone": "033-22435453",
        "email": "dlsa.kolkata@gmail.com",
        "lat": 22.5726,
        "lng": 88.3639,
        "type": "district"
    },
    {
        "name": "DLSA - Pune District Legal Services Authority",
        "city": "Pune",
        "address": "District Court Complex, Shivajinagar, Pune - 411005",
        "phone": "020-25536308",
        "email": "dlsa.pune@gmail.com",
        "lat": 18.5204,
        "lng": 73.8567,
        "type": "district"
    },
    {
        "name": "DLSA - Ahmedabad District Legal Services Authority",
        "city": "Ahmedabad",
        "address": "District Court, Navrangpura, Ahmedabad - 380009",
        "phone": "079-26576800",
        "email": "dlsa.ahmedabad@gmail.com",
        "lat": 23.0225,
        "lng": 72.5714,
        "type": "district"
    },
    {
        "name": "DLSA - Jaipur District Legal Services Authority",
        "city": "Jaipur",
        "address": "High Court Premises, Johari Bazaar, Jaipur - 302003",
        "phone": "0141-2227481",
        "email": "dlsa.jaipur@gmail.com",
        "lat": 26.9124,
        "lng": 75.7873,
        "type": "district"
    },
    {
        "name": "DLSA - Lucknow District Legal Services Authority",
        "city": "Lucknow",
        "address": "District Court Complex, Lucknow - 226001",
        "phone": "0522-2612700",
        "email": "dlsa.lucknow@gmail.com",
        "lat": 26.8467,
        "lng": 80.9462,
        "type": "district"
    }
]


def find_nearest_centers(city: str = None, limit: int = 3):
    """
    Find nearest legal aid centers based on city name
    """
    if city:
        city_lower = city.lower()

        # First try exact city match
        matches = [
            center for center in LEGAL_AID_CENTERS
            if city_lower in center["city"].lower()
        ]

        # If no match found return top centers + national
        if not matches:
            matches = [
                center for center in LEGAL_AID_CENTERS
                if center["type"] == "national"
            ]
            matches += LEGAL_AID_CENTERS[:2]

        return matches[:limit]

    # Default - return national + first 2
    return LEGAL_AID_CENTERS[:limit]


def get_all_centers():
    """Return all legal aid centers"""
    return LEGAL_AID_CENTERS