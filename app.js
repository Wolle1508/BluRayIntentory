var mysql = require('mysql');
var $ = require("jquery")(window);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "bluray",
});

con.connect(function (err) {
  if (err) throw err;
});


let films;

let succesAlert;
let dangerAlert;
let succesAlertContent;
let dangerAlertContent;


window.onload = function () {
  succesAlert = document.getElementById("succesAlert");
  dangerAlert = document.getElementById("dangerAlert");
  succesAlertContent = document.getElementById("succesAlertContent");
  dangerAlertContent = document.getElementById("dangerAlertContent");
  renderDropdown();
  document.getElementById('submit').addEventListener("click", function () {
    let searchCriteria = calculateSearchCriteria();
    renderMainTable(searchCriteria);
  });
  document.getElementById("add").addEventListener("click", function () {
    clearInputs(document.getElementById("addInputs"));
  });
  document.getElementById("submitNew").addEventListener("click", function () {
    insertNew();
  });
  document.getElementById("random").addEventListener("click", function () {
    let random = Math.floor((Math.random() * Object.size(films)) + 1);
    renderMainTableForRandom(films[random]);
  });
  con.query('SELECT * FROM blueray ORDER BY FRANCHISE, YEAR, TITLE ASC', function (error, results, fields) {
    if (error) throw error;
    films = results;
  });
}

function clearInputs(inputs) {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
    inputs[i].style.backgroundColor = "";
  }
}





function filter(searchCriteria, film) { //TODO: Improve Duration/Year
  let pass = true;
  for (var criteria in searchCriteria) {
    if (searchCriteria.hasOwnProperty(criteria)) {
      if (film[criteria.toUpperCase()].includes(searchCriteria[criteria]) == false) {
        pass = false;
      }
    }
  }
  return pass;
}

function renderEditRow(discid) {
  let entryToEdit;
  for (var i = 0; i < films.length; i++) {
    if (films[i].DISCID == discid) entryToEdit = films[i];
  }
  let row = document.getElementById(discid).childNodes;
  for (var td in row) {
    if (row.hasOwnProperty(td)) {
      if (row[td].id != "optionCell" + discid) {
        let content = row[td].innerHTML;
        row[td].innerHTML = "";
        if (row[td].id == "uhd") {

          if (content != "X") {
            row[td].innerHTML = '<div class="form-check" style="margin-right: 15px; margin-top : 10px;"><label><input type="checkbox" name="check" checked id="uhd"><span class="label-text"></span></label></div>'
          } else {
            row[td].innerHTML = '<div class="form-check" style="margin-right: 15px; margin-top : 10px;"><label><input type="checkbox" name="check" id="uhd"><span class="label-text"></span></label></div>'
          }

        } else {
          let textfield = document.createElement("input");
          textfield.className = "form-control";
          textfield.value = content;
          row[td].appendChild(textfield);
        }
      } else {
        row[td].childNodes[0].style.display = "none"; //TODO: handel update
        
        let confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.innerHTML = "confirm";
        confirmButton.id = "confirm" + discid;
        confirmButton.className = "btn btn-success btn-sm";
        confirmButton.style.marginTop = "18px";
        row[td].appendChild(confirmButton);

        let cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.innerHTML = "cancel";
        cancelButton.id = discid;
        cancelButton.className = "btn btn-default btn-sm";
        cancelButton.style.marginTop = "18px";
        cancelButton.style.marginLeft = "5px";
        cancelButton.addEventListener("click", function () {
          cancelRowEdit(row, entryToEdit);
        });
        row[td].appendChild(cancelButton);
      }
    }
  }
}

function cancelRowEdit(row, entry) {
  for (let i = 0; i < row.length; i++) {
    if (!row[i].id.includes("option")) {
      if (row[i].id != "uhd") {
        let content = row[i].id.toUpperCase();
        row[i].innerHTML = "";
        row[i].innerHTML = entry[content];
      } else {
        if (entry.UHD = "NO") {
          row[i].innerHTML = "";
          row[i].innerHTML = "X";
        } else {
          row[i].innerHTML = "";
          row[i].innerHTML = "&#x2713;"
        }
      }
    } else {
      row[i].childNodes[0].style.display = "inline";
      
      row[i].removeChild(row[i].childNodes[1]);
      row[i].removeChild(row[i].childNodes[1]);
    }
  }
}

function insertNew() {
  let inputs = document.getElementById('addInputs');
  let count = 0;
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value == "") {
      inputs[i].style.backgroundColor = "#f8d7da";
    } else {
      count++;
      inputs[i].style.backgroundColor = "";
    }
  }
  // console.log(inputs.length);
  // console.log(count);
  if (count == inputs.length - 1) {
    let queryString = "INSERT INTO BLUERAY (TITLE,DIRECTORS,DURATION,STUDIO,FRANCHISE,YEAR,UHD) VALUES (";
    for (var j = 0; j < inputs.length; j++) {
      if (inputs[j].id == "uhd") {
        if (inputs[j].checked == true) {
          queryString += "'YES'";
        } else {
          queryString += "'NO'";
        }
      } else {
        if (j == inputs.length - 1) {
          queryString += ",'" + inputs[j].value + "'";
        } else {
          queryString += "'" + inputs[j].value + "',";
        }
      }
    }
    queryString += ");";
    console.log(queryString);
    // try {
    //   con.query(queryString, function(error, results, fields) {
    //     if (error) throw error;
    //     succesAlert.style.display = "block";
    //     succesAlertContent.innerHTML = "New Film successfully added!"
    //   })
    // } catch (e) {
    //   dangerAlert.style.display = "block";
    //   dangerAlertContent.innerHTML = e;
    // }
  }

}

Object.size = function (obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function calculateSearchCriteria() {
  let inputs = document.getElementById('inputs');
  document.getElementById('mainTable').innerHTML = "";
  let searchCriteria = {};
  for (var input in inputs) {
    if (inputs.hasOwnProperty(input)) {
      if (inputs[input].type != "button") {
        if (inputs[input].id == "uhd") searchCriteria[inputs[input].id] = inputs[input].checked;
        else if (inputs[input].id == "franchise" && inputs[input].value == "All");
        else if (inputs[input].value != "") searchCriteria[inputs[input].id] = inputs[input].value;
      }
    }
  }
  return searchCriteria;
}