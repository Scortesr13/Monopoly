// Jugador.js
export class Jugador {
  constructor(id, nick, color, bandera, money, position = 0) {
    this.id = id;
    this.nick = nick;
    this.color = color;
    this.bandera = bandera;
    this.money = money;
    this.position = position;
    this.properties = [];
    this.inJail = false;
    this.jailTurns = 0;
    this.hipoteca = false;
    this.prestamos = 0;
  }

  comprarPropiedad(nombre, precio) {
    if (this.money >= precio) {
      this.money -= precio;
      this.properties.push(nombre);
    }
  }

  hipotecar() {
    this.hipoteca = true;
  }

  pedirPrestamo(cantidad) {
    this.money += cantidad;
    this.prestamos += cantidad;
  }
}
