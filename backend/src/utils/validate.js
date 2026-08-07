const validator = require("validator");

const validate = (data) => {
  const allowedFields = ["firstName", "lastName", "email", "password", "role"];
  const receivedFields = Object.keys(data);

  // Prevent Mass Assignment
  const hasUnknownFields = receivedFields.some(
    (field) => !allowedFields.includes(field),
  );
  if (hasUnknownFields) {
    const err = new Error("Invalid properties provided in the request.");
    throw err;
  }

  // Check Missing Fields
  const mandatoryField = ["firstName", "email", "password"];
  const isMissingMandatory = mandatoryField.some(
    (field) => !receivedFields.includes(field),
  );
  if (isMissingMandatory) {
    const err = new Error("Missing required fields: firstName, email, password.");
    throw err;
  }

  // Type Checking & Cleaning (The Fixes!)
  // Check if it's a string first
  if (typeof data.firstName !== 'string') {
    const err = new Error("First name must be text.");
    throw err;
  }
  
 
  data.firstName = validator.trim(data.firstName);
  if (!validator.isLength(data.firstName, { min: 1, max: 50 })) {
    const err = new Error("First name must be between 1 and 50 characters long.");
    throw err;
  }

  if (typeof data.email !== 'string') {
     const err = new Error("Email must be text.");
     throw err;
  }
  data.email = validator.trim(data.email);
  if (!validator.isEmail(data.email)) {
    const err = new Error("Please provide a valid email address.");
    throw err;
  }

  // Validate Password 
  if (typeof data.password !== 'string') {
      const err = new Error("Password must be text.");
      err.statusCode = 400;
      throw err;
  }
  const isStrong = validator.isStrongPassword(data.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    const err = new Error("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.");
    throw err;
  }

  // Validate lastName if it was provided
  if (data.lastName) {
    if (typeof data.lastName !== 'string') {
        const err = new Error("Last name must be text.");
        throw err;
    }
    data.lastName = validator.trim(data.lastName);
    if (!validator.isLength(data.lastName, { min: 1, max: 50 })) {
      const err = new Error("Last name must be between 1 and 50 characters long.");
      throw err;
    }
  }
};

module.exports = validate;