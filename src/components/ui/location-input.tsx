"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

// City list for autocomplete - includes Indian cities and major international cities
const CITIES = [
  // Major Indian Cities
  "Delhi", "New Delhi", "Mumbai", "Bangalore", "Bengaluru", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Varanasi", "Srinagar", "Amritsar", "Allahabad",
  "Prayagraj", "Ranchi", "Coimbatore", "Jodhpur", "Madurai", "Raipur", "Chandigarh",
  "Guwahati", "Mysore", "Mysuru", "Bhubaneswar", "Kochi", "Cochin", "Dehradun",
  "Jammu", "Mangalore", "Udaipur", "Kozhikode", "Calicut", "Tirupati", "Haridwar",
  "Pondicherry", "Puducherry", "Shimla", "Gangtok", "Shillong", "Imphal", "Panaji",
  "Port Blair", "Surat", "Rajkot", "Jamnagar", "Bhavnagar", "Junagadh", "Gandhinagar",
  "Anand", "Nadiad", "Bharuch", "Vapi", "Navsari", "Valsad", "Porbandar", "Morbi",
  "Mehsana", "Palanpur", "Godhra", "Dahod", "Botad", "Amreli", "Veraval", "Dwarka",
  "Somnath", "Diu", "Silvassa", "Daman", "Navi Mumbai", "Kalyan", "Dombivli",
  "Ulhasnagar", "Bhiwandi", "Vasai", "Virar", "Panvel", "Kharghar", "Vashi",
  "Airoli", "Nerul", "Belapur", "Sanpada", "Turbhe", "Kopar Khairane", "Ghansoli",
  "Aurangabad", "Solapur", "Kolhapur", "Sangli", "Satara", "Ratnagiri", "Sindhudurg",
  "Ahmednagar", "Dhule", "Jalgaon", "Akola", "Amravati", "Yavatmal", "Wardha",
  "Chandrapur", "Gondia", "Bhandara", "Gadchiroli", "Nanded", "Latur", "Osmanabad",
  "Beed", "Parbhani", "Hingoli", "Jalna", "Buldhana", "Washim", "Noida",
  "Greater Noida", "Gurgaon", "Gurugram", "Faridabad", "Meerut", "Aligarh",
  "Moradabad", "Bareilly", "Saharanpur", "Muzaffarnagar", "Mathura", "Firozabad",
  "Mainpuri", "Etah", "Hathras", "Agra", "Fatehpur Sikri", "Vrindavan", "Ayodhya",
  "Gorakhpur", "Jhansi", "Allahabad", "Mirzapur", "Sonbhadra", "Banda", "Chitrakoot",
  "Fatehpur", "Pratapgarh", "Sultanpur", "Faizabad", "Ambedkar Nagar", "Basti",
  "Sant Kabir Nagar", "Siddharthnagar", "Maharajganj", "Kushinagar", "Deoria",
  "Azamgarh", "Mau", "Ballia", "Ghazipur", "Jaunpur", "Varanasi", "Chandauli",
  "Bhadohi", "Mirzapur", "Sonbhadra", "Kaushambi", "Rae Bareli", "Amethi",
  "Unnao", "Hardoi", "Sitapur", "Lakhimpur Kheri", "Shahjahanpur", "Pilibhit",
  "Rampur", "Bijnor", "Amroha", "Sambhal", "Budaun", "Etawah", "Auraiya",
  "Kannauj", "Farrukhabad", "Kasganj", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur",
  "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra",
  "Samastipur", "Hajipur", "Sasaram", "Dehri", "Buxar", "Siwan", "Motihari",
  "Saharsa", "Madhubani", "Sitamarhi", "Sheohar", "Supaul", "Kishanganj",
  "Araria", "Forbesganj", "Bettiah", "Raxaul", "Motihari", "Gopalganj", "Chapra",
  // International Cities
  "London", "New York", "Los Angeles", "Chicago", "Toronto", "Sydney", "Melbourne",
  "Singapore", "Dubai", "Abu Dhabi", "Doha", "Riyadh", "Jeddah", "Kuwait City",
  "Muscat", "Bangkok", "Kuala Lumpur", "Jakarta", "Hong Kong", "Tokyo", "Seoul",
  "Beijing", "Shanghai", "Paris", "Berlin", "Amsterdam", "Frankfurt", "Zurich",
  "Geneva", "San Francisco", "Seattle", "Boston", "Washington", "Houston", "Dallas",
  "Atlanta", "Miami", "Vancouver", "Montreal", "Auckland", "Wellington", "Cape Town",
  "Johannesburg", "Nairobi", "Cairo", "Lagos", "Kathmandu", "Dhaka", "Colombo",
  "Karachi", "Lahore", "Islamabad"
];

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onLocationSelect?: (location: string) => void;
}

const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(
  ({ className, onLocationSelect, onChange, value, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState(value?.toString() || "");
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Update input value when value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value.toString());
      }
    }, [value]);

    // Close suggestions when clicking outside
    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setSelectedIndex(-1);

      if (newValue.length >= 1) {
        const filtered = CITIES.filter(city =>
          city.toLowerCase().includes(newValue.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }

      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setInputValue(suggestion);
      setShowSuggestions(false);
      setSuggestions([]);
      
      if (onLocationSelect) {
        onLocationSelect(suggestion);
      }

      // Trigger onChange with the selected value
      if (onChange && inputRef.current) {
        const event = new Event("input", { bubbles: true });
        Object.defineProperty(event, "target", { value: { value: suggestion } });
        inputRef.current.value = suggestion;
        inputRef.current.dispatchEvent(event);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const handleFocus = () => {
      if (inputValue.length >= 1 && suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    return (
      <div ref={wrapperRef} className="relative w-full">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            autoComplete="off"
            {...props}
          />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={cn(
                  "px-4 py-2 cursor-pointer flex items-center gap-2 text-sm",
                  index === selectedIndex
                    ? "bg-orange-50 text-orange-700"
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-3 w-3 text-gray-400" />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

LocationInput.displayName = "LocationInput";

export { LocationInput, CITIES };
