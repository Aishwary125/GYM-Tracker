const APP_ID = 'e34da4c0';
const API_KEY = 'f6df345c7b47e4d794b3be6b714b3556';

// Initialize workout and calorie logs from localStorage
let workoutLogs = JSON.parse(localStorage.getItem('workoutLogs')) || {};
let calorieLog = JSON.parse(localStorage.getItem('calorieLog')) || [];

// Set today's date as default
document.getElementById('log-date').value = new Date().toISOString().split('T')[0];

// Function to log workout
function logWorkout() {
    const date = document.getElementById('log-date').value;
    const exercise = document.getElementById('exercise').value.trim();
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseInt(document.getElementById('weight').value);

    if (!exercise || sets <= 0 || reps <= 0 || weight <= 0) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const workoutEntry = { exercise, sets, reps, weight };

    if (!workoutLogs[date]) workoutLogs[date] = [];
    workoutLogs[date].push(workoutEntry);

    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
    displayWorkouts(date);
}

// Display workouts for selected date
function displayWorkouts(date) {
    const workoutDisplay = document.getElementById('workout-log-display');
    const workouts = workoutLogs[date] || [];
    workoutDisplay.innerHTML = workouts.length ? 
        workouts.map((workout, index) => 
            `<p>${workout.exercise} - ${workout.sets} sets x ${workout.reps} reps @ ${workout.weight} kg 
            <button onclick="deleteWorkout('${date}', ${index})">Delete</button></p>`
        ).join('') : 
        "<p>No workouts logged for this day.</p>";
}

// Delete a workout
function deleteWorkout(date, index) {
    workoutLogs[date].splice(index, 1);
    if (workoutLogs[date].length === 0) delete workoutLogs[date];
    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
    displayWorkouts(date);
}

// Function to set the daily calorie goal
function setCalorieGoal() {
    const goalInput = document.getElementById('calorie-goal').value;
    if (goalInput && goalInput > 0) {
        calorieGoal = parseInt(goalInput);
        localStorage.setItem('calorieGoal', JSON.stringify(calorieGoal));
        displayCalories();
        alert(`Your daily calorie goal is set to ${calorieGoal} kcal.`);
    } else {
        alert("Please enter a valid calorie goal.");
    }
}

// Function to search for food items using the Edamam API
async function searchFood() {
    const foodInput = document.getElementById('food-input').value.trim();
    if (!foodInput) {
        alert("Enter a food item to search.");
        return;
    }

    const url = `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(foodInput)}&app_id=${APP_ID}&app_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayFoodResults(data);
    } catch (error) {
        console.error("Error fetching food data:", error);
    }
}

// Display food search results
function displayFoodResults(data) {
    const foodResults = document.getElementById('food-results');
    foodResults.innerHTML = '';

    if (data.parsed.length) {
        const foodItem = data.parsed[0].food;
        const caloriesPer100g = foodItem.nutrients.ENERC_KCAL || 0;

        foodResults.innerHTML = `
            <p>${foodItem.label}: ${caloriesPer100g.toFixed(2)} kcal per 100g</p>
            <label for="food-weight">Enter weight (g):</label>
            <input type="number" id="food-weight" placeholder="Weight in grams">
            <button onclick="logCalories('${foodItem.label}', ${caloriesPer100g})">Add</button>`;
    } else {
        foodResults.textContent = 'No results found.';
    }
}

// Log the food item with calories based on weight
function logCalories(foodName, caloriesPer100g) {
    const weightInput = document.getElementById('food-weight');
    const weight = parseFloat(weightInput.value);

    if (isNaN(weight) || weight <= 0) {
        alert("Please enter a valid weight.");
        return;
    }

    const totalCalories = (caloriesPer100g * weight) / 100;
    const logEntry = {
        food: foodName,
        weight: weight,
        calories: totalCalories,
        date: new Date().toLocaleDateString()
    };

    calorieLog.push(logEntry);
    localStorage.setItem('calorieLog', JSON.stringify(calorieLog));
    displayCalories();
}

// Display logged calories and remaining calories for the day
function displayCalories() {
    const calorieList = document.getElementById('calorie-list');
    let totalCalories = 0;

    calorieList.innerHTML = calorieLog.map(entry => {
        totalCalories += entry.calories;
        return `<li>${entry.food} - ${entry.weight}g: ${entry.calories.toFixed(2)} kcal
            <button class="delete-btn" onclick="deleteCalorie('${entry.food}', ${entry.weight})">Delete</button></li>`;
    }).join('');

    document.getElementById('total-calories').textContent = totalCalories.toFixed(2);

    // Display remaining calories if goal is set
    if (calorieGoal > 0) {
        const caloriesLeft = calorieGoal - totalCalories;
        document.getElementById('calories-left').textContent = caloriesLeft > 0 ? caloriesLeft.toFixed(2) : 0;
    } else {
        document.getElementById('calories-left').textContent = 'N/A';
    }
}

// Delete a food item from the calorie log
function deleteCalorie(foodName, weight) {
    calorieLog = calorieLog.filter(entry => !(entry.food === foodName && entry.weight === weight));
    localStorage.setItem('calorieLog', JSON.stringify(calorieLog));
    displayCalories();
}

// Display existing log and goal on page load
window.onload = function() {
    displayCalories();
};
// Function to toggle between dark and light mode
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';

    if (currentTheme === 'light') {
        body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Initialize theme based on saved preference
window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = 'Switch to Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
    }
    displayCalories();
};
