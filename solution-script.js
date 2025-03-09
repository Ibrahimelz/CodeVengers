/**
 * Implements the xorshift32 algorithm matching Java's implementation.
 * The key insight is using the correct right shift behavior (>> not >>>)
 * and ensuring proper 32-bit integer handling throughout the process.
 *
 * @param {number} seed - The seed value (a 32-bit signed integer)
 * @returns {number} - The next pseudorandom value produced by the algorithm
 */
function xorshift32(seed) {
  // Convert the input seed to a 32-bit signed integer.
  // The bitwise OR with 0 forces JavaScript to treat the number as a 32-bit integer.
  seed = seed | 0;

  // Perform the first part of the algorithm:
  // Left shift the seed by 13 bits.
  // In Java, left shifting preserves the sign bit, and the bitwise OR with 0
  // ensures the result stays within 32 bits.
  // Then, use XOR (^) to combine the original seed with the shifted value.
  seed ^= (seed << 13) | 0;

  // Perform the second step using a right shift by 17 bits.
  // Java's right shift operator (>>) preserves the sign bit (i.e., sign-extending).
  // It is important to use >> instead of >>> to match Java's behavior.
  // Again, we use bitwise OR with 0 to maintain 32-bit arithmetic.
  seed ^= (seed >> 17) | 0;

  // Perform the final step by left shifting the seed by 5 bits.
  // This step multiplies the current value by 2^5 and then applies XOR to further mix the bits.
  // The OR with 0 again guarantees we remain within 32-bit boundaries.
  seed ^= (seed << 5) | 0;

  // Return the final result as a 32-bit integer.
  return seed | 0;
}

/**
 * Generates a sequence of pseudorandom numbers using the xorshift32 algorithm.
 * Each iteration updates the seed to produce a new pseudorandom number.
 *
 * @param {number} initialSeed - The starting seed value (should be a 32-bit signed integer)
 * @param {number} count - The total number of pseudorandom numbers to generate
 * @returns {Array<number>} - An array containing the generated pseudorandom numbers
 */
function generateSequence(initialSeed, count) {
  // Create an empty array to store the sequence of pseudorandom numbers.
  const sequence = [];
  
  // Set the current seed to the provided initial seed.
  let currentSeed = initialSeed;

  // Loop 'count' times to generate the required number of pseudorandom values.
  for (let i = 0; i < count; i++) {
    // Update the current seed by passing it through the xorshift32 algorithm.
    currentSeed = xorshift32(currentSeed);
    
    // Append the newly generated number to the sequence array.
    sequence.push(currentSeed);
  }

  // Return the full array of generated pseudorandom numbers.
  return sequence;
}

/**
 * Solves the challenge end-to-end by:
 * 1. Fetching the initial data (including uid and initial seed) from a remote API.
 * 2. Generating a pseudorandom number sequence based on the initial seed.
 * 3. Submitting the generated sequence back to the API.
 */
async function solveChallenge() {
  // Define the API endpoint that provides initial data and accepts the generated sequence.
  const apiUrl =
    "http://api25.vanierhacks.net/reverse-engineering/xorshift-java/";

  try {
    // Log a message indicating the start of the initial data fetch.
    console.log("Fetching initial data...");

    // Send a GET request to the API endpoint to retrieve the initial seed and uid.
    const response = await fetch(apiUrl);

    // Check if the response status is successful (HTTP 2xx).
    if (!response.ok) {
      // If the response status is not successful, throw an error with the status code.
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response to extract the uid and initial seed.
    const data = await response.json();

    // Log the received uid and initial seed for debugging purposes.
    console.log(`Received: uid=${data.uid}, initialSeed=${data.initialSeed}`);

    // Generate a sequence of 128 pseudorandom numbers using our xorshift32 implementation.
    const sequence = generateSequence(data.initialSeed, 128);

    // Log the first few values of the generated sequence to verify the output.
    console.log(`First few values: ${sequence.slice(0, 5).join(", ")}`);

    // Log a message indicating that the submission of results is starting.
    console.log("Submitting results...");

    // Prepare an object containing the uid and the generated sequence to submit back to the server.
    const submitData = {
      uid: data.uid,
      generated: sequence,
    };

    // Send a POST request with the generated data to the same API endpoint.
    // The request includes:
    // - Method: POST
    // - Headers: specifying that the content type is JSON
    // - Body: a JSON string representation of the submitData object.
    const submitResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    // Read the response from the submission as plain text.
    const responseText = await submitResponse.text();

    // Log the HTTP status code received from the submission response.
    console.log(`Response status: ${submitResponse.status}`);

    // Check if the submission response was successful.
    if (submitResponse.ok) {
      try {
        // Attempt to parse the response text as JSON.
        const result = JSON.parse(responseText);
        // If successful, log the result with a success message.
        console.log("Success!", result);
      } catch (e) {
        // If parsing fails, log the raw response text.
        console.log("Success! Raw response:", responseText);
      }
    } else {
      // If the submission was not successful, log an error message along with the status code and response text.
      console.error(`Error ${submitResponse.status}: ${responseText}`);
    }
  } catch (error) {
    // Catch any errors that occur during the process and log them for debugging.
    console.error("Error:", error);
  }
}

// Immediately execute the solveChallenge function to run the entire challenge process.
solveChallenge();
