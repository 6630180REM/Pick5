function doGet(e) {
    let page = e.parameter.mode || "index"; // Default to index.html
    let html = HtmlService.createTemplateFromFile(page).evaluate();
    let htmlOutput = HtmlService.createHtmlOutput(html);
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    htmlOutput.addMetaTag('viewport', 'width=device-width,initial-scale=1');
    
    return htmlOutput;
}

function getPageContent(page) {
  return HtmlService.createHtmlOutputFromFile(page).getContent();
}

function myFunction(e) {
  Utilities.sleep(1000);
  return e;
}

function openDialog() {
  var html = HtmlService.createHtmlOutputFromFile("index");
  SpreadsheetApp.getUi().showModalDialog(html, "sample");
}

// function getCurrentWeek() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CurrentWeekPicks');
//   var dataRange = sheet.getRange('A2');
//   var data = dataRange.getValue();
//   const currentWeek = "Week " + data + " Picks";
//   Logger.log(currentWeek);
//   return (currentWeek);
//   ;
// }
function getAllWeekPicks(range) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AllWeeksPicks');
  // const sheetRange = ss.getSheetByName('Team Data');

  const lastRow = sheet.getRange('AM2').getValue();
  const data = sheet.getRange(`A2:AJ${lastRow}`).getValues();

  // Predefine weeks array
  // const weeks = [...new Set(Array.from({ length: 18 }, (_, i) => i + 1))].sort((a, b) => a - b);
  // const weeks = [...new Set(sheet.getRange(`A2:A${lastRow}`).getValues().flat().filter(Boolean))].sort((a, b) => a - b);
  // const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].sort((a, b) => a - b);

  const result = data.map(row => ({
    week: row[0],    // Column A
    name: row[1],    // Column B
    record: row[2],  // Column C
    group: row[33],
    namePopover: row[34],
    titleRecord: row[35],
    picks: [
      { logoUrl: row[3], teamName: row[4], spread: row[5], color: row[6].split(','), score: row[7], spreadcolor: row[28].split(';') },
      { logoUrl: row[8], teamName: row[9], spread: row[10], color: row[11].split(','), score: row[12], spreadcolor: row[29].split(';') },
      { logoUrl: row[13], teamName: row[14], spread: row[15], color: row[16].split(','), score: row[17], spreadcolor: row[30].split(';') },
      { logoUrl: row[18], teamName: row[19], spread: row[20], color: row[21].split(','), score: row[22], spreadcolor: row[31].split(';') },
      { logoUrl: row[23], teamName: row[24], spread: row[25], color: row[26].split(','), score: row[27], spreadcolor: row[32].split(';') }
    ]
  }));
  // Avoid unnecessary logging in production
  // if (range === 'debug') {
  //   Logger.log(result);
  // }
  return {data: result};
}

function getAllWeekPicks2(range) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AllWeeksPicks');
  const lastRow = sheet.getRange('AM2').getValue();
  const data = sheet.getRange(`A2:AJ${lastRow}`).getValues();
  const weekNumbers = sheet.getRange('AN3:AN20').getValues().flat();
  const weekTitles = sheet.getRange('AO3:AO20').getValues().flat();
  const weekHeaders = weekNumbers.map((week, index) => ({
        week: week,
        title: weekTitles[index] || ''
  }));
  const result = data.map(row => {
    const splitSafe = (value, separator) => (value ? value.split(separator) : []);
    return {
      week: row[0],    // Column A
      name: row[1],    // Column B
      record: row[2],  // Column C
      group: row[33],  // Column AI
      namePopover: row[34], // Column AJ
      titleRecord: row[35], // Column AK
      picks: Array.from({ length: 5 }, (_, i) => {
        const baseIndex = i * 5 + 3; // Offset for each pick group
        return {
          logoUrl: row[baseIndex],
          teamName: row[baseIndex + 1],
          spread: row[baseIndex + 2],
          color: splitSafe(row[baseIndex + 3], ','),
          score: row[baseIndex + 4],
          spreadcolor: splitSafe(row[28 + i], ';')
        };
      })
    };
  });
  return { 
    data: result,
    weekHeaders: weekHeaders // Include week headers in the return object
  };
}



function getDefaultDateHeader() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Team Data');
  const defaultDate = sheet.getRange('E2').getValue();
  // Logger.log(defaultDate);
  return defaultDate;
}

function getAllWeekPicksCounts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AllWeeksPicks');
  const weekNumbers = sheet.getRange('AN3:AN20').getValues().flat();
  const weekTitles = sheet.getRange('AO3:AO20').getValues().flat();
  const weekHeaders = weekNumbers.map((week, index) => ({
        week: week,
        title: weekTitles[index] || ''
  }))
  return { 
    weekHeaders: weekHeaders // Include week headers in the return object
  };
}

function getYearlyStandings() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Yearly Standings');
  var dataRange = sheet.getRange('A1:Y191');
  var data = dataRange.getValues();

  var standings = [];
  var weekColumns = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]; // Indices for week columns (H to M)
  var weeksHaveData = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]; // Track if weeks have data

  // Start from row 2 to skip headers
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    var position = row[0];       // Column A
    var movement = row[1];       // Column B
    var name = row[2];           // Column C
    var overallRecord = row[3];  // Column D
    var percentage = row[4];     // Column E
    var picksBack = row[5];      // Column F
    var numWeeks = row[6];       // Column G

    // Check if each week's data is present (not empty) and mark the weeksHaveData array
    for (var j = 0; j < weekColumns.length; j++) {
      if (row[weekColumns[j]]) {
        weeksHaveData[j] = true;  // If any data found for the week, mark as true
      }
    }

    standings.push({
      position: position,
      movement: movement,
      name: name,
      overallRecord: overallRecord,
      percentage: percentage,
      picksBack: picksBack,
      numWeeks: numWeeks,
      week1: row[7],
      week2: row[8],
      week3: row[9],
      week4: row[10],
      week5: row[11],
      week6: row[12],
      week7: row[13],
      week8: row[14],
      week9: row[15],
      week10: row[16],
      week11: row[17],
      week12: row[18],
      week13: row[19],
      week14: row[20],
      week15: row[21],
      week16: row[22],
      week17: row[23],
      week18: row[24]
    });
  }

  return { standings: standings, weeksHaveData: weeksHaveData };
}

function getAllScores() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All Scores Data');
  var sheetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Team Data');
  var lastRow = sheetRange.getRange('F6').getValue();
  var dataRange = sheet.getRange('A1:P' + lastRow);  // Include column O (date)
  const data = dataRange.getValues();
  // Logger.log(data);
  return data.slice(1);
}

function getBowlScores() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Scoring');
  var sheetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Team Data');
  var lastRow = sheetRange.getRange('F6').getValue();
  var dataRange = sheet.getRange('A1:P' + lastRow);  // Include column O (date)
  const data = dataRange.getValues();
  // Logger.log(data);
  return data.slice(1);
}

function getDefaultDateHeader2() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Team Data');
  const defaultDate = sheet.getRange('E1').getValue();
  // Logger.log(defaultDate);
  return defaultDate;
}

function getNavbar(activePage) {
  // var scriptURLHome = getScriptURL("mode=AllPicks");               <a class="nav-item nav-link ${activePage === 'AllPicks' ? 'active' : ''}" href="${scriptURLHome}">All Picks</a>
  var scriptURLPage1 = getScriptURL("mode=Picks");
  var scriptURLPage4 = getScriptURL("mode=Scores");
  var scriptURLPage3 = getScriptURL("mode=Standings");
  var scriptURLPage6 = getScriptURL("mode=Stats");
  var scriptURLPage5 = getScriptURL("mode=EntryForm");

  var showEntryForm = isEntryFormVisible();

  var navbar =
    `<nav id="mainNavbar" class="navbar navbar-expand-sm bg-primary" style="position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1000;background-color: #0067d5 !important; margin-top:0px;margin-bottom:7px">
        <div class="navbar-bar container-fluid text-center">
            <ul class="navbar-nav">
              <a class="nav-item nav-link ${activePage === 'Picks' ? 'active' : ''}" href="${scriptURLPage1}">Picks</a>
              <a class="nav-item nav-link ${activePage === 'Scores' ? 'active' : ''}" href="${scriptURLPage4}">Scores</a>
              <a class="nav-item nav-link ${activePage === 'Standings' ? 'active' : ''}" href="${scriptURLPage3}">Standings</a>
              <a class="nav-item nav-link ${activePage === 'Stats' ? 'active' : ''}" href="${scriptURLPage6}">Stats</a>
              ${showEntryForm ? `<a class="nav-item nav-link ${activePage === 'EntryForm' ? 'active' : ''}" href="${scriptURLPage5}">Entry Form</a>` : ''}
            </ul>
        </div>
      </nav>`;

  return navbar;
}

          // <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation" style="padding:1px;">
          //   <span class="navbar-toggler-icon"></span>
          // </button>
function getBowlNavbar(activePage) {
  var scriptURLPage1 = getScriptURL("mode=BowlPicks");
  var scriptURLPage4 = getScriptURL("mode=BowlScores");
  var scriptURLPage5 = getScriptURL("mode=BowlGameEntryForm");

  var showBowlEntryForm = isBowlEntryFormVisible();

  var navbar =
    `<nav id="mainBowlNavbar" class="navbar navbar-expand-sm bg-primary" style="position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1; padding: 3px; background-color: #a89968 !important;">
        <div class="container-fluid d-flex justify-content-center">
          <div class="navbar-nav d-flex flex-row justify-content-center">
            <a class="nav-item nav-link ${activePage === 'BowlPicks' ? 'active' : ''}" href="${scriptURLPage1}">Bowl Picks</a>
            <a class="nav-item nav-link ${activePage === 'BowlScores' ? 'active' : ''}" href="${scriptURLPage4}">Bowl Scores</a>
            ${showBowlEntryForm ? `<a class="nav-item nav-link ${activePage === 'BowlGameEntryForm' ? 'active' : ''}" href="${scriptURLPage5}">Bowl Entry Form</a>` : ''}
          </div>
        </div>
      </nav>`;

  return navbar;
}



function isEntryFormVisible() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entry Form');
  var cellValue = sheet.getRange('N4').getValue();
  return cellValue !== "No";
}

function isBowlEntryFormVisible() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Entry Form');
  var cellValue = sheet.getRange('N4').getValue();
  return cellValue !== "No";
}

function getScriptURL(qs = null) {
  var url = ScriptApp.getService().getUrl();
  if (qs) {
    if (qs.indexOf("?") === -1) {
      qs = "?" + qs;
    }
    url = url + qs;
  }
  return url;
}

function getEntryMatchups() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entry Form');
  var sheetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Team Data')
  var lastRow = sheetRange.getRange('G6').getValue();
  const data = sheet.getRange('B2:K' + lastRow).getValues(); // Adjust range to include columns B to I
  const matchups = [];

  data.forEach(row => {
    matchups.push({
      awayLogo: row[0],     // Column B - Away Team Logo URL
      awayRank: row[1],     // Column C - Away Team Name
      awayName: row[2],     // Column C - Away Team Name
      awaySpread: row[3],   // Column D - Away Team Spread
      homeLogo: row[4],     // Column E - Home Team Logo URL
      homeRank: row[5],     // Column F - Home Team Name
      homeName: row[6],     // Column F - Home Team Name
      homeSpread: row[7],   // Column G - Home Team Spread
      awayColor: row[8],    // Column H - Away Team Color
      homeColor: row[9]     // Column I - Home Team Color
    });
  });

  return matchups;
}

function submitPickEntries(name, selectedTeamNames, timestamp) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pick Entry');
  const entryFormSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entry Form');
  const week = entryFormSheet.getRange('O3').getValue();
  const formula1 = ('=indirect("A"&row()) & "-" & indirect("H"&row())');
  const formula2 = ('=indirect("G"&row())  = MAXIFS(G:G, I:I, indirect("I"&row()))');
  // Find the next available row for submission
  const lastRow = sheet.getLastRow() + 1;

  sheet.getRange(lastRow, 1).setValue(name);
  for (let i = 0; i < selectedTeamNames.length; i++) {
    sheet.getRange(lastRow, i + 2).setValue(selectedTeamNames[i]);  // Start in the second column for team picks
    sheet.getRange(lastRow, 7).setValue(timestamp);
    sheet.getRange(lastRow, 8).setValue(week);
    sheet.getRange(lastRow, 9).setValue(formula1);
    sheet.getRange(lastRow, 10).setValue(formula2);
    Logger.log(`${name}: ${selectedTeamNames[i]}`); // Combine name and team name
  }
}

function getBowlGameEntryMatchups() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Entry Form');
  const data = sheet.getRange('B2:M39').getValues(); // Adjust range to include columns B to I
  const matchups = [];

  data.forEach(row => {
    matchups.push({
      bowlLogo: row[0],
      bowlName: row[1],
      awayLogo: row[2],     // Column B - Away Team Logo URL
      awayName: row[3],     // Column C - Away Team Name
      awaySpread: row[4],   // Column D - Away Team Spread
      homeLogo: row[5],     // Column E - Home Team Logo URL
      homeName: row[6],     // Column F - Home Team Name
      homeSpread: row[7],   // Column G - Home Team Spread
      awayColor: row[8],    // Column H - Away Team Color
      homeColor: row[9],     // Column I - Home Team Color
      round: row[10],
      matchup:row[11]
    });
  });
  // Logger.log(matchups)
  return matchups;
}

function getPlayoffData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bowl Game Entry Form"); // Replace with your sheet name
  const data = sheet.getRange('C40:M50').getValues()
  
  const rounds = {};
  
  data.forEach(row => {
    const [bowlGame, team1Logo, team1Name, team1Spread, team2Logo, team2Name, team2Spread, team1Color,team2Color,round, matchup] = row;
    
    if (!rounds[round]) rounds[round] = [];
    
    rounds[round].push({
      bowlGame,
      matchup,
      teams: [
        team1Name ? { name: team1Name, seed: team1Spread, color: team1Color, logo: team1Logo } : null,
        team2Name ? { name: team2Name, seed: team2Spread, color: team2Color, logo: team2Logo } : null
      ],
      selected: null // Selected team starts as null
    });
  });
  Logger.log(rounds);
  return rounds;
}


function submitBowlEntries(nameInput, emailInput, normalTeamNames, bracketTeamNames, timestamp) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Pick Entries');
  const lastRow = sheet.getLastRow() + 1;

  // Write Name, Email, and Timestamp
  sheet.getRange(lastRow, 1).setValue(timestamp);  // Column 1: Timestamp
  sheet.getRange(lastRow, 2).setValue(nameInput);  // Column 2: Name
  sheet.getRange(lastRow, 3).setValue(emailInput); // Column 3: Email

  // Write Normal Picks
  const normalStartColumn = 4; // Adjust this based on your sheet structure
  for (let i = 0; i < normalTeamNames.length; i++) {
    sheet.getRange(lastRow, normalStartColumn + i).setValue(normalTeamNames[i] || 'N/A');
  }

  // Write Bracket Picks
  const bracketStartColumn = normalStartColumn + normalTeamNames.length; // Add space after normal picks
  for (let i = 0; i < bracketTeamNames.length; i++) {
    sheet.getRange(lastRow, bracketStartColumn + i).setValue(bracketTeamNames[i] || 'N/A');
  }
}


function getNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entry Form');
  const data = sheet.getRange('A2:A').getValues();  // Assuming names start from row 2
  const names = data.flat().filter(name => name !== '');  // Remove empty values
  return names;
}

function getWeekEntryName() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Entry Form');
  var dataRange = sheet.getRange('N1');
  var data = dataRange.getValue();
  return (data);
  ;
}

function getNationalChamps() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Entry Form');
  const data = sheet.getRange('A2:A13').getValues();  // Assuming names start from row 2
  const names = data.flat().filter(name => name !== '');  // Remove empty values
  return names;
}



function getAllBowlPicks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HTML Bowl Picks');

  if (!sheet) {
    throw new Error('Sheet "Bowl Entries" not found.');
  }

  const sheetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Entry Form');
  const lastRow = sheetRange.getRange('N11').getValue();

  const dataRange = sheet.getRange(`A1:IN${lastRow}`);
  const data = dataRange.getValues();
  const backgroundColors = dataRange.getBackgrounds();

  const result = {
    bowlNames: [], // Array to store the bowl names and background color codes
    entries: []    // Array to store the picks data for each participant
  };

  // Assuming the bowl names are in Row 1, starting from Column D and spaced every 5 columns
  const startColumn = 4; // Starting from Column D (0-based index)
  for (let col = startColumn; col < data[0].length; col += 5) {
    const bowlName = data[0][col]; // Bowl Name
    const bowlColor = data[0][col + 1]; // Background color from every 6th column
    const bowlPopover = data[0][col + 2]; // Background color from every 6th column
    result.bowlNames.push({
      name: bowlName,
      color: bowlColor,
      bowlpop: bowlPopover
    });
  }

  // Iterate through each participant row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const displayName = row[0]; // Column A contains the DisplayName
    const record = row[1];      // Column B contains the Record
    const recordpo = row[2];
    const picks = [];

    // Iterate over the bowl columns (every 5th column starting from Column D)
    let j = 3;
    let bowlIndex = 0;
    while (j < row.length && bowlIndex < result.bowlNames.length) {
      const pickName = row[j];           // Team name (Column D, H, L, etc.)
      const spread = row[j + 1];         // Spread (Column E, I, M, etc.)
      const logoUrl = row[j + 2];        // Logo URL (Column F, J, N, etc.)
      const color = row[j + 3].split(',');          // Color (Column G, K, O, etc.)
                                          
      const score = row[j + 4];          // Score (Column H, L, P, etc.)

      // Ensure each pick is aligned with the bowl name
      picks.push({
        pickName: pickName,
        spread: spread,
        logoUrl: logoUrl,
        color: color,
        score: score
      });

      j += 5; // Move to the next set of columns
      bowlIndex++; // Increment the bowl index
    }

    result.entries.push({
      displayName: displayName,
      record: record,
      recordpo: recordpo,
      picks: picks
    });
  }

  Logger.log(result.entries); // Check if bowl names and colors are correct
  return result;
}



function getAllBowlScores() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bowl Game Scoring');
  const dataRange = sheet.getRange('A1:S48');
  const data = dataRange.getValues();

  const matchups = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const bowlName = row[0];  // Column A: Bowl Name
    const gameTime = row[1];  // Column B: Game Time
    const time = row[2];      // Column C: Time
    const awayLogo = row[3];  // Column D: Away Team Logo URL
    const awayColors = row[4]; // Column E: Away Team Colors
    const awayRank = row[5];   // Column F: Away Team Rank
    const awayTeam = row[6];   // Column G: Away Team Name
    const awaySpread = row[7]; // Column H: Away Team Spread
    const awayScore = row[9];  // Column J: Away Team Score
    const homeLogo = row[10];  // Column K: Home Team Logo URL
    const homeColors = row[11]; // Column L: Home Team Colors
    const homeRank = row[12];  // Column M: Home Team Rank
    const homeTeam = row[13];  // Column N: Home Team Name
    const homeSpread = row[14]; // Column O: Home Team Spread
    const homeScore = row[16]; // Column Q: Home Team Score
    const gamePeriod = row[17]; // Column R: Period
    const displayClock = row[18]; // Column S: Display Clock

    const uniqueKey = `${bowlName}_${gameTime}_${time}`; // Combine bowlName and gameTime as a unique key

    matchups.push([
      uniqueKey,    // Unique identifier for the matchup
      bowlName,     // Bowl Name
      gameTime,     // Game Time
      time,         // Time
      awayLogo,     // Away Team Logo
      awayColors,   // Away Team Colors
      awayRank,     // Away Team Rank
      awayTeam,     // Away Team Name
      awaySpread,   // Away Team Spread
      awayScore,    // Away Team Score
      homeLogo,     // Home Team Logo
      homeColors,   // Home Team Colors
      homeRank,     // Home Team Rank
      homeTeam,     // Home Team Name
      homeSpread,   // Home Team Spread
      homeScore,    // Home Team Score
      gamePeriod,   // Game Period
      displayClock  // Display Clock
    ]);
  }

  console.log(matchups);
  return matchups;
}



function getStatsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Yearly Stats');
  const data = sheet.getRange('H3:S168').getValues();

  return data.map(row => ({
    source: row[0],     
    image: row[1],        
    teamColor: row[2],    
    teamName: row[3], 
    w: row[4], 
    l: row[5],
    coverPercent: row[6],
    pickCount: row[7],
    aw: row[8],   
    al: row[9],            
    hw: row[10],            
    hl: row[11]            
  }));
}

function filterStatsData(filter) {
  const stats = getStatsData();
  if (filter === "ALL") return stats;
  return stats.filter(row => row.source === filter);
}

function getPickFreq(week) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Yearly Stats');
  var lastRow = sheet.getRange('A2').getValue();
  const data = sheet.getRange('B2:F'+ lastRow).getValues();
  Logger.log(data);
  return data.map(row => ({
    week: row[0],
    teamColor: row[1].split(','),
    teamName: row[2],
    pickCount: row[3],
    teamLogo: row[4] 
  })
  )
}

function getFiveAnd0() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Yearly Stats");
    var lastRow = sheet.getRange('X3').getValue();
  const data = sheet.getRange('Y2:AA' + lastRow).getValues(); // Replace with actual range
  const result = data.map(row => ({
    name: row[0],
    count: row[1],
    week: row[2]
  }));
  return result;
}




// Load data from Google Sheets
function getBracketData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bracket Data');
  // const data = sheet.getDataRange().getValues();
    const data = sheet.getRange('A2:J13').getValues();
  
  const rounds = {};
  
  data.forEach(row => {
    const [round, matchup, team1Name, team1Seed, team1Color, team1Logo, team2Name, team2Seed, team2Color, team2Logo] = row;
    
    if (!rounds[round]) rounds[round] = [];
    
    rounds[round].push({
      matchup,
      teams: [
        team1Name ? { name: team1Name, seed: team1Seed, color: team1Color, logo: team1Logo } : null,
        team2Name ? { name: team2Name, seed: team2Seed, color: team2Color, logo: team2Logo } : null
      ],
      selected: null // Selected team starts as null
    });
  });
  
  return rounds;
}


