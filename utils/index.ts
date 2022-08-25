export function randomCodeGenerator(length: number) {
  // the string with all characters empty at first and then the required characters are inserted in it
  let codeCharacters = "";
  codeCharacters += "abcdefghijklmnopqrstuvwxyz";
  codeCharacters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  codeCharacters += "0123456789";

  let result = "";
  // Running a loop and adding a random charachter each time in the result string
  for (let i = 0; i < length; i++)
    result += codeCharacters[Math.floor(Math.random() * codeCharacters.length)];
  return result;
}
