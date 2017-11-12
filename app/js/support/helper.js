module.exports = {
    rounder: rounder,
}
/**
 * Rounds up the given number according to rounding number
 * If the reminder is greater than the half of the rounder
 * it rounds the given number up, otherwise rounds down.
 * The number and the rounder must be positive numbers.
 * @param  {number} number number to be rounded
 * @param  {number} round  rounder
 * @return {number}        rounded number
 */
function rounder(number, round) {
    let reminder = number % round
    console.log('reminder: ' + reminder)

    if (reminder > (round / 2)) {
        return number - reminder + round
    } else {
        return number - reminder
    }
}
