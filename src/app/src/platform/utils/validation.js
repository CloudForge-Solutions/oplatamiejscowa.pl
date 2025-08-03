// src/utils/validation.js - Comprehensive validation utilities
// Based on deprecated settings validation logic

/**
 * Validate Polish NIP (Tax Identification Number)
 * Must be exactly 10 digits with proper checksum
 */
export function validateNIP(nip) {
  if (!nip) {
    return { isValid: false, error: 'NIP jest wymagany' };
  }

  // Remove any non-digit characters
  const cleanNip = nip.replace(/\D/g, '');

  // Check length
  if (cleanNip.length !== 10) {
    return { isValid: false, error: 'NIP musi składać się z 10 cyfr' };
  }

  // Check if all digits are the same (invalid NIP)
  if (/^(\d)\1{9}$/.test(cleanNip)) {
    return { isValid: false, error: 'NIP nie może składać się z samych identycznych cyfr' };
  }

  // Calculate checksum using Polish NIP algorithm
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }

  const checksum = sum % 11;
  const lastDigit = parseInt(cleanNip[9]);

  if (checksum === 10 || checksum !== lastDigit) {
    return { isValid: false, error: 'Nieprawidłowy numer NIP (błędna suma kontrolna)' };
  }

  return { isValid: true, formatted: cleanNip };
}

/**
 * Validate email address format
 */
export function validateEmail(email) {
  if (!email) return true; // Email is optional

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate and format Polish postal code
 */
export function validatePostalCode(postalCode) {
  if (!postalCode) {
    return { isValid: true, formatted: '', error: null };
  }

  // Remove any non-digit characters
  const cleanCode = postalCode.replace(/\D/g, '');

  if (cleanCode.length === 0) {
    return { isValid: true, formatted: '', error: null };
  }

  if (cleanCode.length > 5) {
    return { 
      isValid: false, 
      formatted: postalCode, 
      error: 'Kod pocztowy może mieć maksymalnie 5 cyfr' 
    };
  }

  // Format as XX-XXX
  let formatted = cleanCode;
  if (cleanCode.length >= 2) {
    formatted = `${cleanCode.slice(0, 2)}-${cleanCode.slice(2)}`;
  }

  // Validate complete postal code
  if (cleanCode.length === 5) {
    const postalRegex = /^\d{2}-\d{3}$/;
    if (!postalRegex.test(formatted)) {
      return { 
        isValid: false, 
        formatted, 
        error: 'Nieprawidłowy format kodu pocztowego (XX-XXX)' 
      };
    }
  }

  return { isValid: true, formatted, error: null };
}

/**
 * Validate Polish REGON number
 */
export function validateREGON(regon) {
  if (!regon) return { isValid: true, error: null }; // REGON is optional

  const cleanRegon = regon.replace(/\D/g, '');

  // REGON can be 9 or 14 digits
  if (cleanRegon.length !== 9 && cleanRegon.length !== 14) {
    return { isValid: false, error: 'REGON musi mieć 9 lub 14 cyfr' };
  }

  // Basic checksum validation for 9-digit REGON
  if (cleanRegon.length === 9) {
    const weights = [8, 9, 2, 3, 4, 5, 6, 7];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleanRegon[i]) * weights[i];
    }

    const checksum = sum % 11;
    const lastDigit = parseInt(cleanRegon[8]);

    if (checksum === 10 || checksum !== lastDigit) {
      return { isValid: false, error: 'Nieprawidłowy numer REGON (błędna suma kontrolna)' };
    }
  }

  return { isValid: true, formatted: cleanRegon };
}

/**
 * Validate Polish KRS number
 */
export function validateKRS(krs) {
  if (!krs) return { isValid: true, error: null }; // KRS is optional

  const cleanKrs = krs.replace(/\D/g, '');

  if (cleanKrs.length !== 10) {
    return { isValid: false, error: 'KRS musi składać się z 10 cyfr' };
  }

  return { isValid: true, formatted: cleanKrs };
}

/**
 * Validate phone number (Polish format)
 */
export function validatePhone(phone) {
  if (!phone) return { isValid: true, error: null }; // Phone is optional

  // Remove all non-digit characters except + at the beginning
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Polish phone number patterns
  const patterns = [
    /^\+48\d{9}$/, // +48XXXXXXXXX
    /^48\d{9}$/, // 48XXXXXXXXX
    /^\d{9}$/, // XXXXXXXXX
    /^\d{3}-\d{3}-\d{3}$/ // XXX-XXX-XXX
  ];

  const isValid = patterns.some(pattern => pattern.test(cleanPhone));

  if (!isValid) {
    return { 
      isValid: false, 
      error: 'Nieprawidłowy format numeru telefonu (np. +48123456789)' 
    };
  }

  return { isValid: true, formatted: cleanPhone };
}

/**
 * Validate website URL
 */
export function validateWebsite(website) {
  if (!website) return { isValid: true, error: null }; // Website is optional

  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return { isValid: true, formatted: url.toString() };
  } catch {
    return { 
      isValid: false, 
      error: 'Nieprawidłowy format adresu strony internetowej' 
    };
  }
}

/**
 * Validate IBAN (International Bank Account Number)
 */
export function validateIBAN(iban) {
  if (!iban) return { isValid: false, error: 'Numer konta jest wymagany' };

  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();

  // Check basic format
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleanIban)) {
    return { isValid: false, error: 'Nieprawidłowy format IBAN' };
  }

  // Check length (15-34 characters)
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    return { isValid: false, error: 'IBAN musi mieć od 15 do 34 znaków' };
  }

  // For Polish accounts, check if it's 28 characters
  if (cleanIban.startsWith('PL') && cleanIban.length !== 28) {
    return { isValid: false, error: 'Polski IBAN musi mieć 28 znaków' };
  }

  return { isValid: true, formatted: cleanIban };
}

/**
 * Validate Polish bank account number (26 digits)
 */
export function validatePolishBankAccount(accountNumber) {
  if (!accountNumber) return { isValid: false, error: 'Numer konta jest wymagany' };

  // Remove spaces and non-digit characters
  const cleanNumber = accountNumber.replace(/\D/g, '');

  if (cleanNumber.length !== 26) {
    return { isValid: false, error: 'Polski numer konta musi mieć 26 cyfr' };
  }

  // Format as XXXX XXXX XXXX XXXX XXXX XXXX
  const formatted = cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');

  return { isValid: true, formatted };
}

/**
 * Validate bank account number (IBAN or Polish format)
 * Enhanced version with comprehensive validation and user-friendly messages
 */
export function validateBankAccount(accountNumber) {
  if (!accountNumber) {
    return { isValid: false, error: 'Numer konta jest wymagany' };
  }

  const cleanNumber = accountNumber.replace(/\s/g, '');

  // Check if it looks like IBAN
  if (/^[A-Z]{2}\d{2}/.test(cleanNumber.toUpperCase())) {
    return validateIBAN(accountNumber);
  }

  // Check if it's Polish format (26 digits)
  if (/^\d{26}$/.test(cleanNumber)) {
    return validatePolishBankAccount(accountNumber);
  }

  // More specific error messages based on input
  const digitsOnly = cleanNumber.replace(/\D/g, '');

  if (digitsOnly.length < 26) {
    return {
      isValid: false,
      error: `Numer konta jest za krótki (${digitsOnly.length} cyfr). Polski numer konta powinien mieć 26 cyfr.`
    };
  } else if (digitsOnly.length > 26) {
    return {
      isValid: false,
      error: `Numer konta jest za długi (${digitsOnly.length} cyfr). Polski numer konta powinien mieć 26 cyfr.`
    };
  }

  return {
    isValid: false,
    error: 'Numer konta musi być w formacie IBAN lub polskim (26 cyfr)'
  };
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: `${fieldName} jest wymagane` };
  }
  return { isValid: true };
}

/**
 * Validate field length
 */
export function validateLength(value, min, max, fieldName) {
  if (!value) return { isValid: true }; // Let required validation handle empty values

  const length = value.length;
  
  if (length < min) {
    return { 
      isValid: false, 
      error: `${fieldName} musi mieć co najmniej ${min} znaków` 
    };
  }
  
  if (length > max) {
    return { 
      isValid: false, 
      error: `${fieldName} może mieć maksymalnie ${max} znaków` 
    };
  }
  
  return { isValid: true };
}
