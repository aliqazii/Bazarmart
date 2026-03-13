import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const CITIES = {
  "Islamabad": { postalCode: "44000", province: "Islamabad Capital Territory" },
  "Rawalpindi": { postalCode: "46000", province: "Punjab" },
  "Lahore": { postalCode: "54000", province: "Punjab" },
  "Faisalabad": { postalCode: "38000", province: "Punjab" },
  "Multan": { postalCode: "60000", province: "Punjab" },
  "Gujranwala": { postalCode: "52250", province: "Punjab" },
  "Sialkot": { postalCode: "51310", province: "Punjab" },
  "Bahawalpur": { postalCode: "63100", province: "Punjab" },
  "Sargodha": { postalCode: "40100", province: "Punjab" },
  "Sahiwal": { postalCode: "57000", province: "Punjab" },
  "Rahim Yar Khan": { postalCode: "64200", province: "Punjab" },
  "Sheikhupura": { postalCode: "39350", province: "Punjab" },
  "Jhelum": { postalCode: "49600", province: "Punjab" },
  "Gujrat": { postalCode: "50700", province: "Punjab" },
  "Karachi": { postalCode: "74000", province: "Sindh" },
  "Hyderabad": { postalCode: "71000", province: "Sindh" },
  "Sukkur": { postalCode: "65200", province: "Sindh" },
  "Larkana": { postalCode: "77150", province: "Sindh" },
  "Nawabshah": { postalCode: "67450", province: "Sindh" },
  "Mirpur Khas": { postalCode: "69000", province: "Sindh" },
  "Peshawar": { postalCode: "25000", province: "Khyber Pakhtunkhwa" },
  "Mardan": { postalCode: "23200", province: "Khyber Pakhtunkhwa" },
  "Abbottabad": { postalCode: "22010", province: "Khyber Pakhtunkhwa" },
  "Mansehra": { postalCode: "21300", province: "Khyber Pakhtunkhwa" },
  "Swat": { postalCode: "19200", province: "Khyber Pakhtunkhwa" },
  "Dera Ismail Khan": { postalCode: "29050", province: "Khyber Pakhtunkhwa" },
  "Quetta": { postalCode: "87300", province: "Balochistan" },
  "Turbat": { postalCode: "92600", province: "Balochistan" },
  "Khuzdar": { postalCode: "89100", province: "Balochistan" },
  "Chaman": { postalCode: "86400", province: "Balochistan" },
  "Gilgit": { postalCode: "15100", province: "Gilgit-Baltistan" },
  "Skardu": { postalCode: "16100", province: "Gilgit-Baltistan" },
  "Muzaffarabad": { postalCode: "13100", province: "Azad Kashmir" },
  "Mirpur": { postalCode: "10250", province: "Azad Kashmir" },
};

const PK_PHONE_REGEX = /^(\+92|0)(3[0-9]{2})[0-9]{7}$/;

const Shipping = () => {
  const navigate = useNavigate();
  const savedInfo = JSON.parse(localStorage.getItem("shippingInfo") || "{}");
  const hasSavedAddress = Boolean(savedInfo.address);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [shippingInfo, setShippingInfo] = useState({
    address: savedInfo.address || "",
    city: savedInfo.city || "",
    province: savedInfo.province || "",
    country: "Pakistan",
    postalCode: savedInfo.postalCode || "",
    phoneNo: savedInfo.phoneNo || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await axios.get("/api/v1/users/me/addresses");
        setSavedAddresses(data.addresses || []);
      } catch { /* ignore */ }
    };

    const loadRecovery = async () => {
      if (hasSavedAddress) return;
      try {
        const { data } = await axios.get("/api/v1/innovation/checkout/recovery");
        if (data.recovery?.shippingInfo?.address) {
          setShippingInfo((prev) => ({ ...prev, ...data.recovery.shippingInfo }));
        }
      } catch {
        // ignore recovery errors
      }
    };

    fetchAddresses();
    loadRecovery();
  }, [hasSavedAddress]);

  useEffect(() => {
    if (!shippingInfo.address && !shippingInfo.city && !shippingInfo.phoneNo) return;
    const timer = setTimeout(() => {
      axios.post("/api/v1/innovation/checkout/recovery", {
        shippingInfo,
        lastStep: "shipping",
        abandoned: false,
      }).catch(() => {});
    }, 400);

    return () => clearTimeout(timer);
  }, [shippingInfo]);

  const handleSelectAddress = (addr) => {
    const cityData = CITIES[addr.city];
    setShippingInfo({
      address: addr.address,
      city: addr.city,
      province: cityData?.province || addr.state || "",
      country: "Pakistan",
      postalCode: cityData?.postalCode || addr.pinCode || "",
      phoneNo: addr.phoneNo || "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    const info = CITIES[city];
    setErrors((prev) => ({ ...prev, city: "", postalCode: "", province: "" }));
    setShippingInfo((prev) => ({
      ...prev,
      city,
      province: info ? info.province : "",
      postalCode: info ? info.postalCode : "",
    }));
  };

  const validate = () => {
    const errs = {};

    if (!shippingInfo.address.trim()) {
      errs.address = "Address is required";
    }

    if (!shippingInfo.city) {
      errs.city = "Please select a city";
    }

    const cityData = CITIES[shippingInfo.city];
    if (cityData && shippingInfo.postalCode !== cityData.postalCode) {
      errs.postalCode = `Incorrect postal code for ${shippingInfo.city}. Expected: ${cityData.postalCode}`;
    }

    if (!shippingInfo.postalCode.trim()) {
      errs.postalCode = "Postal code is required";
    }

    const phone = shippingInfo.phoneNo.replace(/[\s-]/g, "");
    if (!PK_PHONE_REGEX.test(phone)) {
      errs.phoneNo = "Enter a valid Pakistani phone number (e.g. 03001234567 or +923001234567)";
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErr = Object.values(errs)[0];
      toast.error(firstErr);
      return;
    }

    const payload = {
      ...shippingInfo,
      phoneNo: shippingInfo.phoneNo.replace(/[\s-]/g, ""),
      pinCode: shippingInfo.postalCode,
      state: shippingInfo.province,
    };

    localStorage.setItem("shippingInfo", JSON.stringify(payload));
    axios.post("/api/v1/innovation/checkout/recovery", {
      shippingInfo: payload,
      lastStep: "shipping",
      abandoned: false,
    }).catch(() => {});
    navigate("/order/confirm");
  };

  return (
    <div className="shipping-page">
      <h1>Shipping Details</h1>

      {savedAddresses.length > 0 && (
        <div className="saved-addresses-section">
          <h3>Use a Saved Address</h3>
          <div className="saved-addresses-list">
            {savedAddresses.map((addr) => (
              <button key={addr._id} className="saved-address-btn" onClick={() => handleSelectAddress(addr)}>
                <strong>{addr.label || "Address"}</strong>
                <span>{addr.address}, {addr.city}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="shipping-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Full Address</label>
          <input
            type="text"
            name="address"
            placeholder="House #, Street, Area"
            value={shippingInfo.address}
            onChange={handleChange}
            className={errors.address ? "input-error" : ""}
          />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label>City</label>
          <select
            name="city"
            value={shippingInfo.city}
            onChange={handleCityChange}
            className={errors.city ? "input-error" : ""}
          >
            <option value="">-- Select City --</option>
            {Object.keys(CITIES).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Province</label>
            <input
              type="text"
              name="province"
              value={shippingInfo.province}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={shippingInfo.postalCode}
              onChange={handleChange}
              className={errors.postalCode ? "input-error" : ""}
            />
            {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value="Pakistan"
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNo"
            placeholder="03001234567"
            value={shippingInfo.phoneNo}
            onChange={handleChange}
            className={errors.phoneNo ? "input-error" : ""}
          />
          {errors.phoneNo && <span className="field-error">{errors.phoneNo}</span>}
          <small className="field-hint">Format: 03XX-XXXXXXX or +923XX-XXXXXXX</small>
        </div>

        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default Shipping;
