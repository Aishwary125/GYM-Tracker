/ Load data from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
    displayWorkoutsByDate(); // Display workouts for today on load
});

// Function to add a workout entry
function addWorkout() {
    const exercise = document.getElementById("exercise").value;
    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;
    const weight = document.getElementById("weight").value;
    const date = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    if (exercise && sets && reps && weight) {
        const workout = { exercise, sets, reps, weight };

        // Fetch workouts from local storage or initialize an empty object
        let workoutsByDate = JSON.parse(localStorage.getItem("workoutsByDate")) || {};

        // Add the workout to the current date
        if (!workoutsByDate[date]) {
            workoutsByDate[date] = [];
        }
        workoutsByDate[date].push(workout);

        // Save updated workouts back to local storage
        localStorage.setItem("workoutsByDate", JSON.stringify(workoutsByDate));

        // Refresh the display
        displayWorkoutsByDate();

        // Clear input fields
        document.getElementById("exercise").value = '';
        document.getElementById("sets").value = '';
        document.getElementById("reps").value = '';
        document.getElementById("weight").value = '';
    }
}

// Function to display workouts for the selected date
function displayWorkoutsByDate() {
    const date = document.getElementById("date-picker").value || new Date().toISOString().split('T')[0];
    const workoutsByDate = JSON.parse(localStorage.getItem("workoutsByDate")) || {};
    const workoutList = document.getElementById("workout-list");

    const workouts = workoutsByDate[date] || [];
    workoutList.innerHTML = workouts.length > 0 
        ? workouts.map((workout, index) => 
            `<li>
                ${workout.exercise}: ${workout.sets} sets x ${workout.reps} reps @ ${workout.weight} kg
                <button class="delete-btn" onclick="deleteWorkout('${date}', ${index})">Delete</button>
            </li>`
        ).join("")
        : "<p>No workouts logged for this date.</p>";
}

// Function to delete a workout entry for a specific date
function deleteWorkout(date, index) {
    let workoutsByDate = JSON.parse(localStorage.getItem("workoutsByDate")) || {};
    if (workoutsByDate[date]) {
        workoutsByDate[date].splice(index, 1);
        if (workoutsByDate[date].length === 0) {
            delete workoutsByDate[date]; // Remove date key if no workouts left
        }
        localStorage.setItem("workoutsByDate", JSON.stringify(workoutsByDate));
        displayWorkoutsByDate();
    }
}
// Initialize the log date as today's date
document.getElementById('log-date').value = new Date().toISOString().split('T')[0];

// Function to log workout details (exercise, reps, sets, weight)
function logWorkout() {
    const exercise = document.getElementById('exercise').value.trim();
    const reps = document.getElementById('reps').value;
    const sets = document.getElementById('sets').value;
    const weight = document.getElementById('weight').value;
    const date = document.getElementById('log-date').value;

    if (!exercise || reps <= 0 || sets <= 0 || weight <= 0) {
        alert("Please fill in all workout fields correctly.");
        return;
    }

    const workoutEntry = {
        exercise,
        reps,
        sets,
        weight,
        date,
    };

    // Retrieve existing workouts from localStorage or initialize an empty array
    const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || {};

    // If the date doesn't exist yet, create a new entry
    if (!workoutLogs[date]) {
        workoutLogs[date] = [];
    }

    // Add the new workout log
    workoutLogs[date].push(workoutEntry);

    // Save updated logs back to localStorage
    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));

    // Clear input fields
    document.getElementById('exercise').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('sets').value = '';
    document.getElementById('weight').value = '';

    alert("Workout logged successfully!");
}

// Function to calculate calories for the entered food item and quantity
async function calculateCalories() {
    const foodItem = document.getElementById("food").value.trim();
    const quantity = document.getElementById("quantity").value;
    const date = document.getElementById('log-date').value;

    if (!foodItem || quantity <= 0) {
        alert("Please enter a valid food item and quantity.");
        return;
    }

    const APP_ID = 'your_app_id';
    const API_KEY = 'your_api_key';

    try {
        const response = await fetch(`https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(foodItem)}&app_id=${APP_ID}&app_key=${API_KEY}`);
        const data = await response.json();

        if (data.hints.length === 0) {
            document.getElementById("calorie-result").textContent = "Food item not found.";
            return;
        }

        const caloriesPer100g = data.hints[0].food.nutrients.ENERC_KCAL;
        const totalCalories = (caloriesPer100g / 100) * quantity;

        // Display the result
        const resultText = `The ${quantity}g of ${foodItem} contains approximately ${totalCalories.toFixed(2)} calories.`;
        document.getElementById("calorie-result").textContent = resultText;

        // Save the result to the calorie log
        saveCalorieLog(foodItem, quantity, totalCalories, date);

        // Display calorie log
        displayCalorieLog(date);
    } catch (error) {
        alert("Error calculating calories.");
        console.error(error);
    }
}

// Function to save calorie log entry to local storage
function saveCalorieLog(foodItem, quantity, totalCalories, date) {
    const calorieEntry = {
        foodItem,
        quantity,
        totalCalories,
        date,
    };

    // Retrieve existing calorie logs from localStorage
    const calorieLogs = JSON.parse(localStorage.getItem('calorieLogs')) || {};

    // If the date doesn't exist yet, create a new entry
    if (!calorieLogs[date]) {
        calorieLogs[date] = [];
    }

    // Add the new calorie log
    calorieLogs[date].push(calorieEntry);

    // Save updated logs back to localStorage
    localStorage.setItem('calorieLogs', JSON.stringify(calorieLogs));
}

// Function to delete a workout log entry
function deleteWorkout(date, index) {
    const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || {};
    
    if (workoutLogs[date]) {
        workoutLogs[date].splice(index, 1);  // Remove the specific entry

        if (workoutLogs[date].length === 0) {
            delete workoutLogs[date];  // If no workouts left for this date, delete the date entry
        }

        localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));

        // Refresh the log display
        showLogs();
    }
}

// Function to delete a calorie log entry
function deleteCalorie(date, index) {
    const calorieLogs = JSON.parse(localStorage.getItem('calorieLogs')) || {};

    if (calorieLogs[date]) {
        calorieLogs[date].splice(index, 1);  // Remove the specific entry

        if (calorieLogs[date].length === 0) {
            delete calorieLogs[date];  // If no calories left for this date, delete the date entry
        }

        localStorage.setItem('calorieLogs', JSON.stringify(calorieLogs));

        // Refresh the log display
        showLogs();
    }
}

// Display workout log for the selected date
function showLogs() {
    const date = document.getElementById('log-date').value;
    const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || {};
    const calorieLogs = JSON.parse(localStorage.getItem('calorieLogs')) || {};

    // Display workout logs
    const workoutDisplay = document.getElementById('workout-log-display');
    const workouts = workoutLogs[date] || [];
    workoutDisplay.innerHTML = workouts.length === 0 ? "<p>No workouts logged for this day.</p>" : 
        workouts.map((workout, index) => 
            `<p>${workout.exercise} - Reps: ${workout.reps}, Sets: ${workout.sets}, Weight: ${workout.weight}kg 
            <button onclick="deleteWorkout('${date}', ${index})">Delete</button></p>`
        ).join('');

    // Display calorie logs
    const calorieDisplay = document.getElementById('calorie-log-display');
    const calories = calorieLogs[date] || [];
    calorieDisplay.innerHTML = calories.length === 0 ? "<p>No calories logged for this day.</p>" :
        calories.map((entry, index) => 
            `<p>${entry.foodItem} - Quantity: ${entry.quantity}g - Calories: ${entry.totalCalories.toFixed(2)}
            <button onclick="deleteCalorie('${date}', ${index})">Delete</button></p>`
        ).join('');
}



// Calorie Intake Calculator
function addCalories() {
    const foodItem = document.getElementById("food-item").value;
    const calories = Number(document.getElementById("calories").value);

    if (foodItem && calories) {
        const entry = { foodItem, calories };
        let calorieLog = JSON.parse(localStorage.getItem("calorieLog")) || [];
        calorieLog.push(entry);
        localStorage.setItem("calorieLog", JSON.stringify(calorieLog));
        displayCalories();
    }
}

function displayCalories() {
    const calorieLog = JSON.parse(localStorage.getItem("calorieLog")) || [];
    const calorieList = document.getElementById("calorie-list");
    const totalCalories = calorieLog.reduce((sum, entry) => sum + entry.calories, 0);

    calorieList.innerHTML = calorieLog.map(entry => 
        `<li>${entry.foodItem}: ${entry.calories} kcal</li>`
    ).join("");
    document.getElementById("total-calories").innerText = totalCalories;
}

function loadCalories() {
    displayCalories();
}
