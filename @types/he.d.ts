declare module 'he' {
  const he: {
    decode: (input: string) => string;
    encode: (input: string) => string;
  };
  export default he;
}