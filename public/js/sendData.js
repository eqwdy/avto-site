async function sendDataToMail(data) {
  try {
    let response = await fetch("/send.php", {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      throw new Error(response.status);
    }

    let answer = await response.json();
    // let answer = await response.text();
    // console.log(answer);
    if (answer.status === "error") {
      throw new Error(answer.errorType);
    }

    return 1;
  } catch (error) {
    console.error(`Throw to mail error: ${error}`);
    return 0;
  }
}

async function sendDataToTg(formData) {
  try {
    let response = await fetch("http://localhost:3000/botApi", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(response.status);
    }

    let answer = await response.json();
    // let answer = await response.text();
    console.log(answer);

    if (answer.status === "error") {
      throw new Error(answer.errorType);
    }

    return 1;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
