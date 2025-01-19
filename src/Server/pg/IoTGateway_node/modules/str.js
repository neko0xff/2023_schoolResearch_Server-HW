/* 把首字母大寫轉小寫 */
function firstLetterToLower(str) {
    if (str.length === 0) return str; 
    return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports={
    firstLetterToLower: firstLetterToLower,
};