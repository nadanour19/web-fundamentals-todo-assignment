
const STUDENT_ID = "12505671";
const API_KEY = "nYs43u5f1oGK9";
const API_BASE = "https://portal.almasar101.com/assignment/api";

// DOM Elements

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");

// Status Helper

function setStatus(message, isError = false) {
  if (!statusDiv) return;
  statusDiv.textContent = message || "";
  statusDiv.style.color = isError ? "#d9363e" : "#666";
}


// Load Tasks on Page Load

document.addEventListener("DOMContentLoaded", function () {
  setStatus("Loading tasks...");

  const url =
    API_BASE +
    "/get.php?stdid=" +
    encodeURIComponent(STUDENT_ID) +
    "&key=" +
    encodeURIComponent(API_KEY);

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.tasks && Array.isArray(data.tasks)) {
        for (var i = 0; i < data.tasks.length; i++) {
          renderTask(data.tasks[i]);
        }
      }
      setStatus(""); // Clear loading message
    })
    .catch(function () {
      setStatus("Failed to load tasks.", true);
    });
});


// Add New Task

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    var title = input.value.trim();
    if (!title) return;

    setStatus("Adding task...");

    var url =
      API_BASE +
      "/add.php?stdid=" +
      encodeURIComponent(STUDENT_ID) +
      "&key=" +
      encodeURIComponent(API_KEY);

    try {
      var res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      var data = await res.json();

      if (data.success) {
        renderTask(data.task || data);
        input.value = "";
        setStatus("Task added successfully.");
      } else {
        throw new Error(data.message || "Failed to add task");
      }
    } catch (err) {
      setStatus(err.message, true);
    }
  });
}


// Render Task Item

function renderTask(task) {
  var li = document.createElement("li");
  li.className = "task-item";

  var span = document.createElement("span");
  span.className = "task-title";
  span.textContent = task.title || task.task || task.name || "Untitled task";

  var deleteBtn = document.createElement("button");
  deleteBtn.className = "task-delete";
  deleteBtn.textContent = "Delete";

  deleteBtn.onclick = function () {
    deleteTask(task.id, li);
  };

  li.appendChild(span);
  li.appendChild(deleteBtn);
  list.appendChild(li);
}

// Delete Task

async function deleteTask(id, liElement) {
  if (!confirm("Delete this task?")) return;

  try {
    var url =
      API_BASE +
      "/delete.php?stdid=" +
      encodeURIComponent(STUDENT_ID) +
      "&key=" +
      encodeURIComponent(API_KEY) +
      "&id=" +
      encodeURIComponent(id);

    var res = await fetch(url);

    if (!res.ok) throw new Error("Network error while deleting task");

    liElement.remove();
    setStatus("Task deleted successfully.");
  } catch (err) {
    console.error(err);
    setStatus(err.message, true);
  }
}
