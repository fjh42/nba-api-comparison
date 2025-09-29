document.getElementById("cmpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const player1 = document.getElementById("player1").value;
  const player2 = document.getElementById("player2").value;
  const season = document.getElementById("season").value || null;
  const is_playoff = document.getElementById("is_playoff").checked;

  const res = await fetch("/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, player2, season, is_playoff }),
  });
  const data = await res.json();
  document.getElementById("result").innerText = JSON.stringify(data, null, 2);
});
