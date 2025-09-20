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

  hipotecar(propiedad, cantidad) {
    this.hipoteca = true;
    this.prestamos += cantidad;
    this.money += cantidad;
    // Retira la propiedad de la lista de propiedades mientras esté hipotecada
    this.properties = this.properties.filter(p => p !== propiedad);
  }

  pagarHipoteca(cantidad, propiedad) {
    const deuda = this.prestamos + Math.floor(this.prestamos * 0.1);
    if (this.money >= deuda) {
      this.money -= deuda;
      this.prestamos = 0;
      this.hipoteca = false;
      // Recupera la propiedad
      this.properties.push(propiedad);
    }
  }

  pedirPrestamo(cantidad) {
    this.money += cantidad;
    this.prestamos += cantidad;
  }
}

