import * as math from 'mathjs';
export default {
    // 加
    add(num1, num2) {
        return math.format(math.add(math.bignumber(num1), math.bignumber(num2)));
    },
    // 乘
    multiply(num1, num2) {
        return math.format(math.multiply(math.bignumber(num1), math.bignumber(num2)));
    },
    // 减
    subtract(num1, num2) {
        return math.format(math.subtract(math.bignumber(num1), math.bignumber(num2)));
    },
    // 除
    divide(num1, num2) {
        return math.format(math.divide(math.bignumber(num1), math.bignumber(num2)));
    }
}