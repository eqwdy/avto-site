async function sendDataToMail(data) {
  try {
    let response = await fetch(
      //   "http://xn----82-53dkc5deutityk0kl.xn--p1ai/botApi",
      "http://localhost/mailApi",
      {
        method: "POST",
        body: data,
      }
    );

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
    let response = await fetch(
      //   "http://xn----82-53dkc5deutityk0kl.xn--p1ai/botApi",
      "http://localhost/botApi",
      {
        method: "POST",
        body: formData,
      }
    );

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
    console.error(`Throw to tg error: ${error}`);
    return 0;
  }
}
