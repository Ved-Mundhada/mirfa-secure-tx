async function runServerTest() {
  const API_URL = "http://localhost:3001";
  const testData = {
    partyId: "test_user_99",
    payload: { message: "Internal Mirfa Secret", amount: 1000 }
  };

  console.log("Starting API Server Test...");

  try {
    console.log("Step 1: Testing /tx/encrypt...");
    const encRes = await fetch(`${API_URL}/tx/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const { id } = await encRes.json();
    console.log(`Received Transaction ID: ${id}`);

    console.log("Step 2: Testing /tx/:id (Fetching encrypted blob)...");
    const getRes = await fetch(`${API_URL}/tx/${id}`);
    const blob = await getRes.json();
    
    if (blob.payload_ct) {
      console.log("Success: Data is safely encrypted in the database.");
    }

    console.log("Step 3: Testing /tx/:id/decrypt...");
    const decRes = await fetch(`${API_URL}/tx/${id}/decrypt`, { method: 'POST' });
    const originalData = await decRes.json();

    if (originalData.message === testData.payload.message) {
      console.log("Step 4: Comparison Success! Original data recovered.");
      console.log("FINAL STATUS: ALL API TESTS PASSED");
    } else {
      throw new Error("Data mismatch!");
    }

  } catch (error) {
    console.error("Test Failed:", error);
  }
}

runServerTest();