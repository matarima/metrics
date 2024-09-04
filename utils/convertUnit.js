// Cache tạm thời trong bộ nhớ
const cache = {};

// Hàm hỗ trợ chuyển đổi các đơn vị đo với caching
const convertUnit = (value, fromUnit, toUnit, type) => {
  // Tạo khóa cache dựa trên loại, đơn vị và giá trị
  const cacheKey = `${type}_${fromUnit}_${toUnit}_${value}`;

  // Kiểm tra nếu kết quả đã có trong cache
  if (cache[cacheKey]) {
    // console.log(`Lấy kết quả từ cache cho ${cacheKey}`);
    return cache[cacheKey]; // Trả về kết quả từ cache nếu đã có
  }

  const conversionRates = {
    // Chuyển đổi các đơn vị khoảng cách
    Distance: {
      Meter: {
        Centimeter: 100, // 1 mét = 100 cm
        Inch: 39.37, // 1 mét = 39.37 inch
        Feet: 3.28084, // 1 mét = 3.28084 feet
        Yard: 1.09361, // 1 mét = 1.09361 yard
      },
      Centimeter: {
        Meter: 0.01, // 1 cm = 0.01 mét
      },
    },
    // Chuyển đổi đơn vị nhiệt độ
    Temperature: {
      Celsius: {
        Fahrenheit: (value) => (value * 9) / 5 + 32, // Chuyển từ C sang F
        Kelvin: (value) => value + 273.15, // Chuyển từ C sang K
      },
      Fahrenheit: {
        Celsius: (value) => ((value - 32) * 5) / 9, // Chuyển từ F sang C
        Kelvin: (value) => ((value - 32) * 5) / 9 + 273.15, // Chuyển từ F sang K
      },
      Kelvin: {
        Celsius: (value) => value - 273.15, // Chuyển từ K sang C
        Fahrenheit: (value) => ((value - 273.15) * 9) / 5 + 32, // Chuyển từ K sang F
      },
    },
  };

  // Kiểm tra loại chỉ số (Distance hoặc Temperature)
  const conversionType = conversionRates[type];
  if (!conversionType) {
    throw new Error(`Loại chỉ số ${type} không hợp lệ để chuyển đổi.`);
  }

  // Kiểm tra đơn vị chuyển đổi (từ fromUnit sang toUnit)
  const conversionFuncOrRate = conversionType[fromUnit]?.[toUnit];
  if (!conversionFuncOrRate) {
    throw new Error(
      `Không thể chuyển đổi từ ${fromUnit} sang ${toUnit} cho loại chỉ số ${type}.`
    );
  }

  // Nếu là hàm, thực thi hàm chuyển đổi
  const convertedValue =
    typeof conversionFuncOrRate === "function"
      ? conversionFuncOrRate(value)
      : value * conversionFuncOrRate;

  // Lưu kết quả vào cache
  cache[cacheKey] = convertedValue;

  return convertedValue;
};

module.exports = convertUnit;
