"use strict";

let todoList = [];

const YOUR_API_KEY = "$2a$10$4L4DIXkmhqFOuplpG0v5meSVGNPQQtFq4KAjROORHFduED5MEvo16";
const BIN_ID = "68f24e4143b1c97be96d2292";
const GROQ_API_KEY = "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";

let req = new XMLHttpRequest();
req.responseType = "json";

req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
        console.log(req.response);
        todoList = req.response.record;
    }
};

req.open("GET", `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, true);
req.setRequestHeader("X-Master-Key", YOUR_API_KEY);
req.send(JSON.stringify(todoList));

function updateJSONbin() {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            console.log(req.response);
        }
    };

    req.open("PUT", `https://api.jsonbin.io/v3/b/${BIN_ID}`, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", YOUR_API_KEY);
    req.send(JSON.stringify(todoList));
}

function updateTodoList() {
    let todoListDiv = document.getElementById("todoListView");
    todoListDiv.innerHTML = ""; 

    let filterInput = document.getElementById("inputSearch").value.toLowerCase().trim();
    let startDateInput = document.getElementById("startDate");
    let endDateInput = document.getElementById("endDate");

    let startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    let endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    let filteredTodos = todoList.filter(todo => {
        let matchesText =
            filterInput === "" ||
            todo.title.toLowerCase().includes(filterInput) ||
            todo.description.toLowerCase().includes(filterInput);

        let dueDate = new Date(todo.dueDate);
        let matchesDate =
            (!startDate || dueDate >= startDate) &&
            (!endDate || dueDate <= endDate);

        return matchesText && matchesDate;
    });

    filteredTodos.forEach((todo, index) => {
        let cardCol = document.createElement("div");
        cardCol.className = "col-12 col-lg-6";

        let card = document.createElement("div");
        card.className = "card shadow h-100";

        let cardBody = document.createElement("div");
        cardBody.className = "card-body";

        cardBody.innerHTML = `
        <h5 class="card-title">${todo.title}</h5>
        <p class="card-text">${todo.description}</p>
        <p class="card-text"><small>Place: ${todo.place || "-"}</small></p>
        <p class="card-text"><small>Category: ${todo.category || "-"}</small></p>
        <p class="card-text"><small>Due: ${new Date(todo.dueDate).toLocaleDateString()}</small></p>
        <button class="btn btn-sm btn-danger">Remove</button>
    `;

        let deleteBtn = cardBody.querySelector("button");
        deleteBtn.addEventListener("click", function () {
            deleteTodo(todo);
        });

        card.appendChild(cardBody);
        cardCol.appendChild(card);
        todoListDiv.appendChild(cardCol);
    });

};


setInterval(updateTodoList, 1000);

function deleteTodo(todoToRemove) {

    const index = todoList.indexOf(todoToRemove);

    todoList.splice(index, 1);
    updateJSONbin();
}

async function addTodo() {
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");

    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);

    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: await getArtificialWisdom(newTitle + ": " + newDescription),
        dueDate: newDate
    };

    todoList.push(newTodo);

    document.getElementById("todoForm").reset();

    updateJSONbin();
}

async function getArtificialWisdom(task) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: `Please decide about category of task: \"${task}\". Please match language of response to language of task. Answer with minimal quantity of words but preserve meaning, use only name of the category. Do not add excessive punctuation marks.` }],
    }),
  });
  
  const data = await res.json();

  return data.choices[0].message.content || 'Other';
}