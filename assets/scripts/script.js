async function fetchData() {
  const [matchesResponse, leagueResponse] = await Promise.all([
    fetch('https://europastats.vercel.app/1r4AR5yDnQ9LLlVovYv-vaYc_Ik8UfGdPx5DbWOEVhtI/Dades'),
    fetch('https://europastats.vercel.app/1r4AR5yDnQ9LLlVovYv-vaYc_Ik8UfGdPx5DbWOEVhtI/Season')
  ]);

  const matches = await matchesResponse.json();
  const league = await leagueResponse.json();

  return [matches, league];
}

fetchData().then(([matches, league]) => {
  // Remove loading
  document.getElementById("placeholder").remove();
  // Show table & controls
  document.getElementsByClassName("table-responsive-sm")[0].style.display = "flex";
  //document.getElementsByClassName("controls")[0].style.display = "flex";
  // Find our table
  let tbodyRef = document.getElementById("fixtures").getElementsByTagName("tbody")[0];
  var countNextMatch = 0;
  matches.forEach(row => {
    // Parse each row of our spreadsheet data
    // Start by declaring variables for our different columns
    let jornada = row.Jornada;
    var data = row.Data;
    let hora = row.Hora;
    var casa = row.Casa;
    var fora = row.Fora;
    let banderaCasa = row["Bandera Casa"];
    let banderaFora = row["Bandera Fora"];
    let estadi = row.Estadi;
    var infoClub = row["Info Club"];
    let twitter = row.Twitter;
    var infoClubFora = row["Info Club Fora"];
    let twitterFora = row["Twitter Fora"];

    // Insert new row using our tbodyRef variable
    let newRow = tbodyRef.insertRow();
    // Insert cells to the new row
    let cellJornada = newRow.insertCell(0);
    let cellData = newRow.insertCell(1);
    let cellHora = newRow.insertCell(2);
    let cellCasa = newRow.insertCell(3);
    let cellFora = newRow.insertCell(4);
    let cellEstadi = newRow.insertCell(5);

    cellJornada.classList.add("jornada");
    cellData.classList.add("data");
    cellHora.classList.add("hora");
    cellCasa.classList.add("casa");
    cellFora.classList.add("fora");
    cellEstadi.classList.add("estadi");

    // Tweak variables
    if (casa == "CE Europa") {
      var casa = "<strong>" + casa + "</strong>";
      cellCasa.classList.add("europa");
    }
    if (fora == "CE Europa") {
      var fora = "<strong>" + fora + "</strong>";
      cellFora.classList.add("europa");
    }

    // Check clubs have a website/YT - not always the case
    if (infoClub.length < 1) {
      infoClub = "";
    } else {
      infoClub = " <a href='" + infoClub + "' target='_blank'><i class='fa-solid fa-circle-info'></i></a>";
    }
    if (infoClubFora.length < 1) {
      infoClubFora = "";
    } else {
      infoClubFora = "<a href='" + infoClubFora + "' target='_blank'><i class='fa-solid fa-circle-info'></i></a> ";
    }

    // Work out past & future matches
    var matchDate = new Date(data.split('/')[2], data.split('/')[1] - 1, data.split('/')[0]);
    //console.log(matchDate);
    var today = new Date();
    if (matchDate < today) {
      newRow.classList.add("past");
    } else if (matchDate == today) {
      newRow.classList.add("today");
      countNextMatch++;
      newRow.classList.add("next-match");
      newRow.id = "next";
    } else {
      newRow.classList.add("future");
      if (countNextMatch == 0) {
        newRow.classList.add("next-match");
        countNextMatch++;
        newRow.id = "next";
      }
    }
    //console.log(matchDate);
    
    // Take out the first YY digits from the YYYY
    var firstPartDate = data.substring(0,6);
    var secondPartDate = data.substring(8,10);
    data = firstPartDate + secondPartDate;

    // Add content to the cells
    cellJornada.innerHTML = jornada;
    cellData.innerHTML = data;
    cellHora.innerHTML = hora;
    cellCasa.innerHTML = "<img src='" + banderaCasa + "' width='30px' height='30px' alt='" + casa + "'> " + casa + " <a href='" + twitter + "' target='_blank'><i class='fa-brands fa-twitter'></i></a>" + infoClub;
    cellFora.innerHTML = infoClubFora + "<a href='" + twitterFora + "' target='_blank'><i class='fa-brands fa-twitter'></i></a> " + fora + " <img src='" + banderaFora + "' width='30px' height='30px' alt='" + fora + "'>";
    cellEstadi.innerHTML = "<a href='" + estadi + "' target='_blank'><i class='fa-solid fa-location-dot'></i></a>";
  });
  league.forEach(row => {
    var matchesPlayed = row["Matches played"];
    var leaguePosition = row["League position"];
    var goalsScored = row["Goals"];
    var penaltiesScored = row["Penalties scored"];
    var goalsConceded = row["Goals conceded"];
    var currentStandings = "<div class='col-12'>";
    currentStandings += "Pre-partit: </span>";
    currentStandings += "<span>Posició lliga: " + leaguePosition + "</span> | ";
    currentStandings += "<span>Gols a favor: " + goalsScored + "</span> | ";
    currentStandings += "<span>Gols en contra: " + goalsConceded + "</span>";
    currentStandings += "</div>";
    var nextMatchRow = document.querySelector("#next");
    var europaCell = nextMatchRow.querySelector(".europa");
    europaCell.innerHTML += (currentStandings);
  })
}).catch(error => {
  console.error(error.message);
  let mainContent = document.getElementById("main-content");
  let errorDiv = document.createElement("div")
  errorDiv.classList.add("alert", "alert-danger");
  errorDiv.append("Hi ha haigut un error en la cerca de les dades :( Torna a provar més tard."); 
  mainContent.append(errorDiv);
});

// Only show future matches?
function showFuture() {
  var pastMatches = document.getElementsByClassName("past");
  if (document.getElementById("future-only").checked) {
    for(i = 0; i < pastMatches.length; i++) {
      pastMatches[i].classList.add("hidden");
    }
  } else {
    for(i = 0; i < pastMatches.length; i++) {
      pastMatches[i].classList.remove("hidden");
    }
  }
}

// Allow user to filter table
function filterTeams(event) {
  var filter = event.target.value.toUpperCase();
  var rows = document.querySelector("#fixtures tbody").rows;
  
  for (var i = 0; i < rows.length; i++) {
    var firstCol = rows[i].cells[3].textContent.toUpperCase();
    var secondCol = rows[i].cells[4].textContent.toUpperCase();
    if (firstCol.indexOf(filter) > -1 || secondCol.indexOf(filter) > -1) {
        rows[i].style.display = "";
    } else {
        rows[i].style.display = "none";
    }      
  }
}

document.querySelector('#filter').addEventListener('keyup', filterTeams, false);