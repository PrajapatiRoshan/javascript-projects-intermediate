'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, durations) {
    this.coords = coords; //[lat.lng]
    this.distance = distance; // in km
    this.durations = durations; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, durations, cadence) {
    super(coords, distance, durations);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.durations / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, durations, elevationGain) {
    super(coords, distance, durations);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.durations / 60);
    return this.speed;
  }
}

class App {
  #mapEvent;
  #mapZoomLevel = 13;
  #map;
  #workout = [];
  #marker = [];

  constructor() {
    this._getPoisition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  // user geo locations
  _getPoisition() {
    navigator.geolocation?.getCurrentPosition(
      // set map based on user geo locations
      this._loadMap.bind(this),
      function () {
        alert('Could not get your position');
      }
    );
  }

  // load leafLet interactive map
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
    this.#map.on('click', this._showform.bind(this));
    this._getLocalStorage();
  }

  // show form
  _showform(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // hide form
  _hideForm() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  // chnage on dropdown
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // on form submit
  _newWorkout(e) {
    e.preventDefault();

    const validInput = (...inputs) =>
      inputs.every(_inp => Number.isFinite(_inp));

    const allPositive = (...inputs) => inputs.every(_inp => _inp > 0);

    //Get data from Form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data valid
      if (
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workout.push(workout);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    this._hideForm();
    this._setLocalStorage();
  }

  // Add workouts
  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${
            workout.description
          }<span class="material-symbols-sharp delete"> delete </span></h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'cycling' ? '🚴‍♀️' : '🏃‍♂️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.durations}</span>
            <span class="workout__unit">min</span>
          </div>
          `;
    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  // Add marker to map
  _renderWorkoutMarker(workout) {
    const _marker = L.marker(workout.coords).addTo(this.#map);
    _marker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'cycling' ? '🚴‍♀️' : '🏃‍♂️'} ${workout.description}`
      )
      .openPopup();

    this.#marker.push(_marker);
  }

  // move map based on workout click
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    const delWorkOut = e.target.closest('.delete');

    if (!workoutEl) return;

    if (delWorkOut) {
      this._removeMarker(workoutEl);
    } else {
      const workout = this.#workout.find(
        work => work.id === workoutEl.dataset.id
      );
      this.#map.setView(workout.coords, this.#mapZoomLevel, {
        animate: true,
        pan: { duration: 1 },
      });
    }
  }

  // remove marker
  _removeMarker(workoutEl) {
    this.#workout = this.#workout.filter(
      work => work.id !== workoutEl.dataset.id
    );
    const workoutId = this.#workout.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    const removeM = this.#marker[workoutId];
    this.#marker = this.#marker.filter(
      mark => mark._leaflet_id !== removeM._leaflet_id
    );
    removeM.remove();
    workoutEl.remove();
    this._setLocalStorage();
  }

  // render all workout
  _renderAllWorkout() {
    this.#workout.forEach(work => {
      this._renderWorkout(work);
      this._renderWorkoutMarker(work);
    });
  }

  //set local storage
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout));
  }

  //get local storage
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workout = data;
    this._renderAllWorkout();
  }

  //set local storage
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
