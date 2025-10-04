export async function askOllama(prompt) {
  const res = await fetch("http://localhost:3000/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.response;
}
