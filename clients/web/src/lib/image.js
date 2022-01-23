export function getPublicImage(filename) {
  const { PUBLIC_URL } = process.env;

  return `${PUBLIC_URL}/${filename}`;
}
