const addUserBtn = document.getElementById('add-person-btn');

const save = document.getElementById('save');
const cancel = document.getElementById('cancel');

const calculateBtn = document.getElementById('calculate-cases');

const mainComponent = document.getElementById('main');
const addComponent = document.getElementById('add-user');

addUserBtn.addEventListener('click', () => {
	showAddPerson();
});

save.addEventListener('click', () => {
	clearErrors();
	const node = document.createElement("li");
	const name = document.getElementById('name-input').value
	const numberOfTasks = document.getElementById('number-input').value
	
	if(name ==="" || numberOfTasks === ""){
		addError("please enter a value for name and number of pledges");
		return;
	}

	let item = 'Person : ' + name + ' Number of pledges : ' + numberOfTasks;
	const userQuantityItem = document.createTextNode(item);
	node.appendChild(userQuantityItem);
	document.getElementById("user-list").appendChild(node);
	
	showMain();

	document.getElementById('name-input').value = "";
	document.getElementById('number-input').value = "";

});

cancel.addEventListener('click', () => {
	
	showMain();
	clearErrors();
	document.getElementById('name-input').value = "";
	document.getElementById('number-input').value = "";
});

calculateBtn.addEventListener('click', () => {
	document.getElementById("output-list").innerHTML = "";
	var peopleQuantities = new Map();
	const allPeople = document.getElementById('user-list').getElementsByTagName("li");

	for (var i = 0; i < allPeople.length; i++) {
		let text = allPeople[i].textContent;
		text = text.replace(/Person : /g, "");
		text = text.replace(/ Number of pledges : /g, "-");
		var a = text.split("-");

		peopleQuantities.set(a[0], parseInt(a[1]));
	}
	//setup initial vars
	var totalTasks = parseInt(document.getElementById("case-number").value);
	var userTaskQuantities = peopleQuantities;
	var median = Math.floor(totalTasks / userTaskQuantities.size);

	var totalTasksAllUsersCanHandle = 0;

	var iterations = userTaskQuantities.size;
	while (iterations > 0) {

		median = Math.floor(totalTasks / userTaskQuantities.size);
		//loop through all of the quantities. All which are below the cut off get max, removed from the list of quanitities / total.
		var iterationHasOutput = false;
		for (const [key, value] of userTaskQuantities.entries()) {
			totalTasksAllUsersCanHandle += value;
			if (value < median) {
				outputListItem(key, value)
				totalTasks = totalTasks - value;
				userTaskQuantities.delete(key);
				iterationHasOutput = true;
			}
		}
		//Too many tasks check.
		if (totalTasks > totalTasksAllUsersCanHandle) {
			outputExceededTasksError()
			return;
		}
		//if all remaining values of tasks are greated than the minimum. Just return the remaining tasks / remaining people
		if (!iterationHasOutput) {
			var quotient = Math.floor(totalTasks / userTaskQuantities.size);
			var remainder = totalTasks % userTaskQuantities.size;

			for (const [key] of userTaskQuantities.entries()) {
				let quantity = 0;
				if (remainder > 0) {
					quantity = quotient + 1;
				} else {
					quantity = quotient;
				}
				remainder--;

				outputListItem(key, quantity);
			}
			//break loop
			iterations = 0;
		}
		iterations--;
	}
	document.getElementById("file-download-btn").hidden = false;
});

// Function to download data to a file
function download() {
	var fileName = "Pledge Tool " + new Date().toUTCString() + ".csv";
    var file = new Blob([generateData()], {type: ".csv"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, fileName);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
function generateData(){

	const outputData = document.getElementById('output-list').getElementsByTagName("li");
	var peopleQuantities = new Map();
	for (var i = 0; i < outputData .length; i++) {
		let text = outputData[i].textContent;
		var a = text.split(":");

		peopleQuantities.set(a[0], parseInt(a[1]));
	}
	let rows = new Array();
	rows.push(["name", "pledges"]);
	for (const [key, value] of peopleQuantities.entries()) {
		rows.push([key, value])
	}
	
	let csvContent = ""
	rows.forEach(function(rowArray) {
		let row = rowArray.join(",");
		csvContent += row + "\r\n";
	});
	return csvContent;
}
function outputListItem(key, value) {

	const node = document.createElement("li");

	const outputVar = document.createTextNode(key + ":" + value);

	node.appendChild(outputVar);

	document.getElementById("output-list").appendChild(node);
}

function outputExceededTasksError() {

	const node = document.createElement("li", class{'error-text'});

	const outputVar = document.createTextNode("Total number of pledges exceeds the number people can handle");

	node.appendChild(outputVar);

	document.getElementById("output-list").appendChild(node);
}

function showMain(){
	mainComponent.style.display = 'flex';

	addComponent.style.display = 'none';
}
function showAddPerson(){
	mainComponent.style.display = 'none';

	addComponent.style.display = 'flex';
}

function clearErrors(){
	document.getElementById('error-text').innerHTML ="";
}
function addError(text){
	document.getElementById('error-text').innerHTML =text;
}
