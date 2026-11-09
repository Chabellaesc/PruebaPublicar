// VARIABLES DE TIEMPO
let seg, minuto, hora, dia, mes;

//VARIABLES DEL ESPIRAL
let vueltas = 5;
let anguloFinal;
let radioInicial = 10;
let radioFinal = 300;
let incrementoAngulo = 0.05;

/* LÍMITES DE ACERCAMIENTO DE LAS MARIQUITAS
Durante las horas normales (0 a 22), se acercan pero NUNCA llegan
a tocarse: la chica llega máximo hasta t = 0.45, la grande hasta t = 0.55.*/
let tMaxA_normal = 0.45;
let tMinB_normal = 0.55;

// Última hora del día (23): cada una tiene su propia meta,
// muy cerca la una de la otra pero no exactamente igual.
let tMetaFinalA = 0.492;
let tMetaFinalB = 0.508;

function setup() {
  createCanvas(700, 700);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100); // ahora los colores se definen como (matiz, saturación, brillo)
  anguloFinal = TWO_PI * vueltas;
}

function draw() {
  seg = second();
  minuto = minute();
  hora = hour();
  dia = day();
  mes = month();

  let colores = calcularColoresDelMomento(); // un solo lugar que decide todos los colores de la escena

  background(colores.fondo);
  dibujarfondo(colores); // hojas decorativas, usando los mismos colores calculados

  translate(width / 2, height / 2);

  dibujarEspiral();
  dibujarMariquitas();
}

/* 
CALCULAR LOS COLORES SEGÚN EL MOMENTO DEL DÍA
   Día (6:00am - 5:00pm): tonos verdes
   Atardecer (5:00pm - 6:30pm): tonos naranjas
   Noche (6:30pm - 6:00am): tonos azules oscuros

   Usamos HSB: definimos un "matiz" (el color base: verde/naranja/azul)
   y luego variamos el brillo y la saturación entre el fondo y las hojas
   para que, aunque compartan el mismo matiz, se sigan viendo los
   detalles y el contraste (las hojas no se pierden dentro del fondo).
*/
function calcularColoresDelMomento() {
  let minutosDelDia = hora * 60 + minuto; // convertimos hora+minuto a minutos totales, más fácil de comparar

  let matiz, satFondo, briFondo, satHoja, briHoja, satLinea, briLinea;

  if (minutosDelDia >= 360 && minutosDelDia < 1020) {
    //  // 360 = 6:00am ... 1020 = 5:00pm -> DÍA (verde clarito)
    matiz = 110;
    satFondo = 35;
    briFondo = 95;
    satHoja = 75;
    briHoja = 55;
    satLinea = 60;
    briLinea = 90;
  } else if (minutosDelDia >= 1020 && minutosDelDia < 1110) {
    // 1020 = 5:00pm ... 1110 = 6:30pm -> ATARDECER (naranja)
    matiz = 30;
    satFondo = 70;
    briFondo = 95;
    satHoja = 80;
    briHoja = 55;
    satLinea = 65;
    briLinea = 90;
  } else {
    // NOCHE (azul oscuro)
    matiz = 230;
    satFondo = 60;
    briFondo = 25;
    satHoja = 55;
    briHoja = 15;
    satLinea = 45;
    briLinea = 40;
  }
  // Devolvemos un objeto con todos los colores ya armados y listos para usar
  return {
    fondo: color(matiz, satFondo, briFondo),
    hoja: color(matiz, satHoja, briHoja),
    lineaHoja: color(matiz, satLinea, briLinea),
  };
}

// FUNCIÓN: DIBUJAR EL ESPIRAL

function dibujarEspiral() {
  stroke(30, 60, 45); // color café en HSB (matiz café, saturación, brillo)
  strokeWeight(6);
  noFill();
  beginShape();
  for (let angulo = 0; angulo < anguloFinal; angulo += incrementoAngulo) {
    let radio = map(angulo, 0, anguloFinal, radioInicial, radioFinal);
    let x = radio * cos(angulo);
    let y = radio * sin(angulo);
    vertex(x, y);
  }
  endShape();
}

//FUNCIÓN: HOJAS DEL FONDO
function dibujarfondo(colores) {
  push();
  translate(400, 50);
  scale(3);
  rotate(-0.523599);
  dibujarHoja(colores);
  pop();

  push();
  translate(10, 400);
  scale(3);
  rotate(0.523599);
  dibujarHoja(colores);
  pop();

  push();
  translate(60, -140);
  scale(4);
  rotate(0.785398);
  dibujarHoja(colores);
  pop();

  push();
  translate(550, 390);
  scale(3.5);
  rotate(0.785398);
  dibujarHoja(colores);
  pop();
}

function dibujarHoja(colores) {
  fill(colores.hoja);
  noStroke();
  ellipse(42, 36, 20, 45);
  stroke(colores.lineaHoja);
  strokeWeight(1);
  line(41, 14, 41, 57);
  line(42, 22, 50, 28);
  line(41, 31, 33, 35);
  line(41, 41, 48, 46);
}

/*
   FUNCIÓN: CALCULAR EL PROGRESO DENTRO DE LA HORA ACTUAL
   Usé solo "minuto" (no seg) para que la posición
   en el espiral se quede fija durante los 60 segundos de ese minuto.
   Así, mientras pasan los segundos, la mariquita solo gira sobre su
   propio eje (rotación) sin trasladarse ni un poquito; el salto de
   posición ocurre una única vez, exactamente cuando el minuto cambia.
*/
function calcularProgresoHora() {
  let progreso = map(minuto, 0, 59, 0, 1);
  progreso = constrain(progreso, 0, 1);
  return progreso;
}

/* 
   FUNCIÓN: CONVERTIR UN VALOR t (0 a 1) EN UNA POSICIÓN SOBRE EL ESPIRAL
*/
function posicionEnEspiral(t) {
  let angulo = map(t, 0, 1, 0, anguloFinal);
  let radio = map(t, 0, 1, radioInicial, radioFinal);
  let x = radio * cos(angulo);
  let y = radio * sin(angulo);
  return { x: x, y: y };
}

/*
   FUNCIÓN: DIBUJAR Y MOVER LAS DOS MARIQUITAS
*/
function dibujarMariquitas() {
  let progreso = calcularProgresoHora();

  let tA, tB;

  if (hora == 23) {
    tA = map(progreso, 0, 1, 0, tMetaFinalA);
    tB = map(progreso, 0, 1, 1, tMetaFinalB);
  } else {
    tA = map(progreso, 0, 1, 0, tMaxA_normal);
    tB = map(progreso, 0, 1, 1, tMinB_normal);
  }
  // Crecimiento MUY sutil de cada mariquita por hora
  let factorHora = map(hora, 0, 23, 1, 1.3);

  // Rotación sobre su propio eje: una vuelta completa cada 60 segundos
  let anguloGiro = map(seg, 0, 59, 0, TWO_PI);

  let posA = posicionEnEspiral(tA);
  let posB = posicionEnEspiral(tB);
  // Tamaños base: La diferencia entre las dos es pequeña (0.6 vs 0.72)
  dibujarMariquitaEnPosicion(posA.x, posA.y, anguloGiro, factorHora * 0.6);
  dibujarMariquitaEnPosicion(posB.x, posB.y, anguloGiro, factorHora * 0.72);
}

function dibujarMariquitaEnPosicion(x, y, angulo, escala) {
  push();
  translate(x, y);
  rotate(angulo);
  scale(escala);
  dibujarMariquita();
  pop();
}

/* 
   FUNCIÓN: DIBUJAR UNA MARIQUITA
   Los arc() ahora usan radians()
 */
function dibujarMariquita() {
  fill(0, 0, 0);
  noStroke();
  ellipse(0, -1, 90, 100);

  fill(0, 100, 60);
  noStroke();
  arc(-7, 2, 90, 105, radians(95), radians(275));
  arc(13, 2, 90, 105, radians(-95), radians(-275));

  fill(0, 0, 0);
  ellipse(-24, -32, 15, 15);
  ellipse(-37, -8, 20, 20);
  ellipse(-19, 12, 20, 20);
  ellipse(-27, 33, 15, 15);
  ellipse(23, -32, 15, 15);
  ellipse(36, -8, 20, 20);
  ellipse(25, 12, 20, 20);
  ellipse(32, 33, 15, 15);
}

