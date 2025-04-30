export default function handler(req, res) {
  const secretValue = "This is a server secret";
  console.log("Running on the server: " + secretValue);
  
  return res.status(200).json({ message: "Hello from server" });
}
