const GroupTypes = Object.freeze({
    OPEN: 'Open',
    PRIVATE: 'Private',
});

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
};

const validateGroupName = (groupName) => {
    return typeof groupName === 'string' && groupName.trim().length > 0;
};

const validateGroupCreation = (groupName, groupType, maxMembers) => {
    if (!validateGroupName(groupName)) {
        return 'Invalid group name';
    }
    if (!Object.values(GroupTypes).includes(groupType)) {
        return `Invalid group type. Must be one of: ${Object.values(GroupTypes).join(', ')}`;
    }
    if (typeof maxMembers !== 'number' || maxMembers <= 2) {
        return 'Max members must be a number greater than 2';
    }
    return null;
}

module.exports = {
    GroupTypes,
    validateEmail,
    validatePassword,
    validateGroupName,
    validateGroupCreation,
};