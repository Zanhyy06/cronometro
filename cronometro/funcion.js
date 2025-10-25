const cronometros = [];

// Función para logear eventos del loop
function logLoop(mensaje) {
  const ul = document.getElementById("log-list");
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()}: ${mensaje}`;
  ul.prepend(li);
}

// Clase del cronómetro
class Cronometro {
  constructor(elemento, id) {
    this.id = id;
    this.display = elemento.querySelector(".display");
    this.inputTiempo = elemento.querySelector(".tiempo-input");
    this.btnIniciar = elemento.querySelector(".iniciar");
    this.btnPausar = elemento.querySelector(".pausar");
    this.btnReiniciar = elemento.querySelector(".reiniciar");

    this.duracion = parseInt(this.inputTiempo.value) * 1000;
    this.tiempoRestante = this.duracion;
    this.startTime = 0;
    this.corriendo = false;
    this.rafId = null;

    this._asignarEventos();
    this._actualizarDisplay(this.tiempoRestante);
  }

  _actualizarDisplay(ms) {
    if (ms < 0) ms = 0;
    const totalSegundos = ms / 1000;
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = Math.floor(totalSegundos % 60);
    const centesimas = Math.floor((totalSegundos * 100) % 100);
    this.display.textContent = `${minutos.toString().padStart(2,"0")}:${segundos.toString().padStart(2,"0")}.${centesimas.toString().padStart(2,"0")}`;
  }

  _loop = () => {
    if (!this.corriendo) return;

    // 🔹 Macrotarea
    logLoop(`Cronómetro ${this.id} - Macrotarea setTimeout`);
    setTimeout(() => {

      // 🔹 Microtarea
      Promise.resolve().then(() => {
        logLoop(`Cronómetro ${this.id} - Microtarea Promise`);

        const ahora = performance.now();
        const transcurrido = ahora - this.startTime;
        const restante = this.tiempoRestante - transcurrido;

        this._actualizarDisplay(restante);

        if (restante <= 0) {
          this.reiniciar();
          alert(`⏰ Cronómetro ${this.id} ha terminado`);
        } else {
          // 🔹 Render loop
          requestAnimationFrame(() => {
            logLoop(`Cronómetro ${this.id} - Render loop rAF`);
            this._loop();
          });
        }
      });

    }, 0);
  }

  iniciar(startTimeGlobal = null, tiempoBase = null) {
    if (!this.corriendo) {
      this.corriendo = true;
      this.startTime = startTimeGlobal || performance.now();
      this.tiempoRestante = tiempoBase ?? parseInt(this.inputTiempo.value) * 1000;
      this.rafId = requestAnimationFrame(this._loop);
      logLoop(`Cronómetro ${this.id} iniciado`);
    }
  }

  pausar() {
    if (this.corriendo) {
      this.corriendo = false;
      const ahora = performance.now();
      this.tiempoRestante -= ahora - this.startTime;
      cancelAnimationFrame(this.rafId);
      logLoop(`Cronómetro ${this.id} pausado`);
    }
  }

  reiniciar() {
    this.corriendo = false;
    cancelAnimationFrame(this.rafId);
    this.tiempoRestante = parseInt(this.inputTiempo.value) * 1000;
    this._actualizarDisplay(this.tiempoRestante);
    logLoop(`Cronómetro ${this.id} reiniciado`);
  }

  _asignarEventos() {
    this.inputTiempo.addEventListener("change", () => {
      this.duracion = parseInt(this.inputTiempo.value) * 1000;
      this.tiempoRestante = this.duracion;
      this._actualizarDisplay(this.tiempoRestante);
      logLoop(`Cronómetro ${this.id} tiempo cambiado a ${this.inputTiempo.value}s`);
    });

    this.btnIniciar.addEventListener("click", () => this._controlar("iniciar"));
    this.btnPausar.addEventListener("click", () => this._controlar("pausar"));
    this.btnReiniciar.addEventListener("click", () => this._controlar("reiniciar"));
  }

  _controlar(accion) {
    if (this.id === 1 || this.id === 2) {
      const otro = this.id === 1 ? cronometros[1] : cronometros[0];
      const startTimeGlobal = performance.now();
      const tiempoBase = this.tiempoRestante;

      switch(accion){
        case "iniciar":
          this.iniciar(startTimeGlobal, tiempoBase);
          otro.iniciar(startTimeGlobal, tiempoBase);
          break;
        case "pausar":
          this.pausar();
          otro.pausar();
          break;
        case "reiniciar":
          this.reiniciar();
          otro.reiniciar();
          break;
      }
    } else {
      this[accion]();
    }
  }
}

// Inicializar cronómetros
document.querySelectorAll(".cronometro").forEach((el, i) => {
  cronometros.push(new Cronometro(el, i+1));
});
