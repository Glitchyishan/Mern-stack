document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById('submitbutton');
    const userInput = document.getElementById("userinput");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    const easyProgressCircle = document.querySelector(".easyprogress");
    const mediumProgressCircle = document.querySelector(".mediumprogress");
    const hardProgressCircle = document.querySelector(".hardprogress");

    // Validate username
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }


    function getCountByDifficulty(array, difficulty) {
        const item = array.find(q => q.difficulty === difficulty);
        return item ? item.count : 0;
    }

    
    function updateProgress(solved, total, label, circle) {
        const progressDegree = total > 0 ? (solved / total) * 100 : 0;

        
        if (!label.dataset.original) {
            label.dataset.original = label.textContent.trim();
        }

        
        label.textContent = `${label.dataset.original}: ${solved}/${total}`;

        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    }

    // Display user data
    function displayUserData(parsedData) {
        const allCounts = parsedData.data.allQuestionsCount;
        const solvedCounts = parsedData.data.matchedUser.submitStats.acSubmissionNum;

        const totalEasyQues = getCountByDifficulty(allCounts, "Easy");
        const totalMediumQues = getCountByDifficulty(allCounts, "Medium");
        const totalHardQues = getCountByDifficulty(allCounts, "Hard");

        const solvedEasyQues = getCountByDifficulty(solvedCounts, "Easy");
        const solvedMediumQues = getCountByDifficulty(solvedCounts, "Medium");
        const solvedHardQues = getCountByDifficulty(solvedCounts, "Hard");

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgressCircle);
    }

    // Fetch user details
    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                      allQuestionsCount {
                        difficulty
                        count
                      }
                      matchedUser(username: $username) {
                        submitStats {
                          acSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                          totalSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                        }
                      }
                    }
                `,
                variables: { username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const parsedData = await response.json();
            console.log("Logging data:", parsedData);

            displayUserData(parsedData);
        }
        catch (error) {
            console.error("Error fetching details:", error);
        }
        finally {
            searchButton.textContent = "Analyze Profile";
            searchButton.disabled = false;
        }
    }

    // Button click handler
    searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        const username = userInput.value;
        console.log("Logging username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});

