import { PrismaClient, Modalidad, Periodo, TipoAsistente } from "@prisma/client";

const prisma = new PrismaClient();

// Texto compartido tomado de los bloques de Vambe (identidad, formato, no-hacer).
const IDENTIDAD_GABRIELA =
  "Eres Gabriela, una asistente apasionada y detallista en Dmoov Corp, un gimnasio. " +
  "Tu papel es reflejar dedicación en cada interacción. Lineamientos clave: 1) Claridad y " +
  "precisión, 2) Entusiasmo y motivación, 3) Invitación a la acción (ofrece promociones para " +
  "la primera visita), 4) Resolución eficiente, 5) Reflejar valores de calidad y pasión por el fitness.";

const FORMATO_RESPUESTA =
  "Responder de forma concreta, máximo 400 caracteres. Tono semiformal, amigable y accesible. " +
  "Máximo un emoji por mensaje. Respuesta clara y precisa, sin información adicional que confunda.";

const DO_NOT =
  "No inventar información fuera de la base de conocimiento. No enviar datos de pago. No inventar " +
  "precios. No agendar citas. No ofrecer enviar info al correo. No inventar datos de transferencia. " +
  "No inventar ofertas/planes. Ante duda de precios, priorizar transparencia indicando que se necesita verificar.";

const ENRUTADOR_INSTRUCCIONES =
  "1. Revisa si el cliente mencionó una sede. Si no, preséntate y comparte lista numerada " +
  "(1.Chicureo, 2.Mall Sport, 3.Pirque, 4.Puerto Varas, 5.Peñuelas, 6.Escuela Militar, 7.Talca). " +
  "Anota 'sede de interes' en metadata y etiqueta.\n" +
  "1.1-1.7: Cambia de etapa a la IA de la sede correspondiente. Peñuelas -> asesor +56945282918. " +
  "Escuela Militar -> asesor +56946987258.\n" +
  "Casos: si no puede responder o piden humano -> 'Soporte de Vendedor'. " +
  "Baja de pago recurrente -> solo presencial en sucursal.";

type SedeSeed = {
  nombre: string;
  slug: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefonoVentas?: string;
  telefonoRecepcion?: string;
  asesorWhatsapp?: string;
  horario?: string;
  derivaAsesor?: boolean;
};

const SEDES: SedeSeed[] = [
  {
    nombre: "Chicureo",
    slug: "chicureo",
    direccion: "Av. El Valle 12810",
    comuna: "Colina",
    region: "Región Metropolitana",
    telefonoVentas: "56957258468",
    horario: "Lun-Vie 6:00-22:00, Sáb-Dom 9:00-14:00",
  },
  {
    nombre: "Mall Sport",
    slug: "mall-sport",
    direccion: "Av. Las Condes 13451, 2º piso",
    comuna: "Las Condes",
    region: "Región Metropolitana",
    telefonoVentas: "56940185882",
    telefonoRecepcion: "56953338201",
    horario: "Lun-Vie 6:00-22:00, Sáb 9:00-18:00, Dom 9:00-14:00",
  },
  {
    nombre: "Pirque",
    slug: "pirque",
    direccion: "Av. Hernán Prieto S/N",
    comuna: "Pirque",
    region: "Región Metropolitana",
    telefonoVentas: "56928741824",
    horario: "Lun-Vie 6:00-22:00, Sáb-Dom-Festivo 9:00-14:00",
  },
  {
    nombre: "Puerto Varas",
    slug: "puerto-varas",
    direccion: "Ricardo Neumann Wittwer 1001",
    comuna: "Puerto Varas",
    region: "Los Lagos",
    telefonoVentas: "56932583990",
    horario: "Lun-Vie 6:00-23:00, Sáb 8:00-18:00, Dom 9:00-14:00",
  },
  {
    nombre: "Peñuelas",
    slug: "penuelas",
    direccion: "Regimiento Arica 1641, Local 103",
    comuna: "Coquimbo",
    region: "Coquimbo",
    asesorWhatsapp: "56945282918",
    derivaAsesor: true,
    horario: "Lun-Vie 6:00-14:00, Sáb-Dom 9:00-14:00",
  },
  {
    nombre: "Escuela Militar",
    slug: "escuela-militar",
    direccion: "Av. Apoquindo 4501, Local 6",
    comuna: "Las Condes",
    region: "Región Metropolitana",
    asesorWhatsapp: "56946987258",
    derivaAsesor: true,
    horario: "Lun-Vie 6:30-22:00, Sáb-Dom 8:00-14:00",
  },
  {
    nombre: "Talca",
    slug: "talca",
    direccion: "Av. Pehuenche Norte con calle 1 Sur, Paseo Hacienda",
    comuna: "Talca",
    region: "Maule",
    telefonoVentas: "56928546435",
    horario: "Lun-Vie 6:00-22:00, Sáb-Dom-Festivo 9:00-14:00",
  },
];

type PlanSeed = {
  nombre: string;
  modalidad: Modalidad;
  periodo: Periodo;
  precioClp: number;
  precioPromoClp?: number;
  matriculaClp?: number;
  descripcion?: string;
};

const PLANES: Record<string, PlanSeed[]> = {
  "mall-sport": [
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.TRIMESTRAL, precioClp: 180000 },
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.SEMESTRAL, precioClp: 390000 },
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.ANUAL, precioClp: 580000 },
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.TRIMESTRAL, precioClp: 295000 },
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.SEMESTRAL, precioClp: 495000 },
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.ANUAL, precioClp: 780000 },
    { nombre: "Full", modalidad: Modalidad.RECURRENTE, periodo: Periodo.MENSUAL, precioClp: 59000 },
    { nombre: "Light", modalidad: Modalidad.RECURRENTE, periodo: Periodo.MENSUAL, precioClp: 48000 },
  ],
  chicureo: [
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.ANUAL, precioClp: 780000 },
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.SEMESTRAL, precioClp: 495000 },
    { nombre: "Full", modalidad: Modalidad.PREPAGO, periodo: Periodo.TRIMESTRAL, precioClp: 295000 },
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.ANUAL, precioClp: 580000 },
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.SEMESTRAL, precioClp: 390000 },
    { nombre: "Light", modalidad: Modalidad.PREPAGO, periodo: Periodo.TRIMESTRAL, precioClp: 180000 },
    { nombre: "Full", modalidad: Modalidad.RECURRENTE, periodo: Periodo.MENSUAL, precioClp: 62000 },
    { nombre: "Light", modalidad: Modalidad.RECURRENTE, periodo: Periodo.MENSUAL, precioClp: 47000 },
    {
      nombre: "Personal Trainer VIP Anual",
      modalidad: Modalidad.PREPAGO,
      periodo: Periodo.VIP,
      precioClp: 2800000,
      descripcion: "120 sesiones",
    },
  ],
  pirque: [
    {
      nombre: "RP",
      modalidad: Modalidad.RECURRENTE,
      periodo: Periodo.MENSUAL,
      precioClp: 60000,
      precioPromoClp: 55000,
      matriculaClp: 55000,
    },
    { nombre: "Semestral", modalidad: Modalidad.PREPAGO, periodo: Periodo.SEMESTRAL, precioClp: 405000, precioPromoClp: 283500 },
    { nombre: "Anual", modalidad: Modalidad.PREPAGO, periodo: Periodo.ANUAL, precioClp: 600000, precioPromoClp: 432000 },
    {
      nombre: "VIP Anual",
      modalidad: Modalidad.PREPAGO,
      periodo: Periodo.VIP,
      precioClp: 2500000,
      precioPromoClp: 1750000,
      descripcion: "120 sesiones",
    },
  ],
};

const ETAPAS = [
  { nombre: "Nuevo", orden: 1, color: "#888780" },
  { nombre: "En enrutador", orden: 2, color: "#378ADD" },
  { nombre: "IA de sede", orden: 3, color: "#1D9E75" },
  { nombre: "Interesado en planes", orden: 4, color: "#7F77DD" },
  { nombre: "Day Pass", orden: 5, color: "#EF9F27" },
  { nombre: "Link de pago enviado", orden: 6, color: "#D85A30" },
  { nombre: "Compra de plan", orden: 7, color: "#639922" },
  { nombre: "Soporte de vendedor", orden: 8, color: "#D4537E" },
  { nombre: "Cliente activo", orden: 9, color: "#0F6E56", esFinal: true },
  { nombre: "Perdido", orden: 10, color: "#A32D2D", esFinal: true },
];

const ETIQUETAS = [
  { nombre: "Chicureo", descripcion: "Interés en sede Chicureo" },
  { nombre: "Mall Sport", descripcion: "Interés en sede Mall Sport" },
  { nombre: "Pirque", descripcion: "Interés en sede Pirque" },
  { nombre: "Puerto Varas", descripcion: "Interés en sede Puerto Varas" },
  { nombre: "Peñuelas", descripcion: "Interés en sede Peñuelas (deriva a asesor)" },
  { nombre: "Escuela Militar", descripcion: "Interés en sede Escuela Militar (deriva a asesor)" },
  { nombre: "DayPass", descripcion: "Solicitó o se registró un Day Pass" },
  { nombre: "Compra de plan", descripcion: "Quiere comprar un plan" },
  { nombre: "Link enviado y no pagó", descripcion: "Se envió link de pago y no pagó en 15 min" },
];

const EJECUTIVOS = [
  { nombre: "Lucas Apablaza", email: "lucas.apablaza@dmoov.com", rol: "admin" },
  { nombre: "Roger Duarte", rol: "vendedor", sedeSlug: "mall-sport" },
  { nombre: "Guillermo Delgado", rol: "vendedor", sedeSlug: "mall-sport" },
];

async function main() {
  console.log("Sembrando configuración...");
  const config: Record<string, string> = {
    moneda: "CLP",
    ia_modelo: "gemini-3.1-pro",
    daypass_precio_clp: "25000",
    daypass_primero_gratis: "true",
    pago_timeout_minutos: "15",
  };
  for (const [clave, valor] of Object.entries(config)) {
    await prisma.configuracion.upsert({ where: { clave }, update: { valor }, create: { clave, valor } });
  }

  console.log("Sembrando etapas del pipeline...");
  for (const e of ETAPAS) {
    await prisma.etapa.upsert({ where: { nombre: e.nombre }, update: e, create: e });
  }

  console.log("Sembrando etiquetas...");
  for (const e of ETIQUETAS) {
    await prisma.etiqueta.upsert({ where: { nombre: e.nombre }, update: e, create: e });
  }

  console.log("Sembrando sedes...");
  const sedeIdPorSlug: Record<string, string> = {};
  for (const s of SEDES) {
    const sede = await prisma.sede.upsert({ where: { slug: s.slug }, update: s, create: s });
    sedeIdPorSlug[s.slug] = sede.id;
  }

  console.log("Sembrando planes...");
  for (const [slug, planes] of Object.entries(PLANES)) {
    const sedeId = sedeIdPorSlug[slug];
    for (const p of planes) {
      // Clave lógica: sede + nombre + modalidad + periodo. Se recrea si ya existía.
      await prisma.plan.deleteMany({
        where: { sedeId, nombre: p.nombre, modalidad: p.modalidad, periodo: p.periodo },
      });
      await prisma.plan.create({ data: { ...p, sedeId } });
    }
  }

  console.log("Sembrando ejecutivos...");
  for (const ej of EJECUTIVOS) {
    const { sedeSlug, ...rest } = ej as any;
    const data = { ...rest, sedeId: sedeSlug ? sedeIdPorSlug[sedeSlug] : undefined };
    if (data.email) {
      await prisma.ejecutivo.upsert({ where: { email: data.email }, update: data, create: data });
    } else {
      const existe = await prisma.ejecutivo.findFirst({ where: { nombre: data.nombre } });
      if (!existe) await prisma.ejecutivo.create({ data });
    }
  }

  console.log("Sembrando asistentes (13)...");
  const asistentes: { nombre: string; tipo: TipoAsistente; sedeSlug?: string }[] = [
    { nombre: "Enrutador Inicial", tipo: TipoAsistente.ENRUTADOR },
    ...SEDES.map((s) => ({ nombre: `IA ${s.nombre}`, tipo: TipoAsistente.SEDE, sedeSlug: s.slug })),
    { nombre: "Pago online", tipo: TipoAsistente.PAGO_ONLINE },
    { nombre: "DayPass", tipo: TipoAsistente.DAYPASS },
    { nombre: "Interesado en Planes", tipo: TipoAsistente.INTERESADO_PLANES },
    { nombre: "Redirigir pago completado", tipo: TipoAsistente.REDIRIGIR_PAGO },
    { nombre: "Inicial", tipo: TipoAsistente.INICIAL },
  ];

  for (const a of asistentes) {
    const esEnrutador = a.tipo === TipoAsistente.ENRUTADOR;
    const esSede = a.tipo === TipoAsistente.SEDE;
    const data = {
      nombre: a.nombre,
      tipo: a.tipo,
      sedeId: a.sedeSlug ? sedeIdPorSlug[a.sedeSlug] : undefined,
      modelo: "gemini-3.1-pro",
      promptIdentidad: esSede ? `${IDENTIDAD_GABRIELA}\n\nFORMATO:\n${FORMATO_RESPUESTA}\n\nNO HACER:\n${DO_NOT}` : null,
      promptInstrucciones: esEnrutador ? ENRUTADOR_INSTRUCCIONES : null,
    };
    await prisma.asistente.upsert({ where: { nombre: a.nombre }, update: data, create: data });
  }

  const resumen = {
    sedes: await prisma.sede.count(),
    planes: await prisma.plan.count(),
    etapas: await prisma.etapa.count(),
    etiquetas: await prisma.etiqueta.count(),
    ejecutivos: await prisma.ejecutivo.count(),
    asistentes: await prisma.asistente.count(),
  };
  console.log("Listo. Resumen:", resumen);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
