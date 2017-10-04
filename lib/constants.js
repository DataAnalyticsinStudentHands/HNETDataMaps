flagsHash = {
  0: {
    val: 0,
    description: 'zero',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green'
  },
  1: {
    val: 1,
    description: 'valid',
    label: 'K',
    selectable: true,
    color: '#BF0B23',
    color10: 'transparent',
    labelcolor: 'label-danger'
  },
  2: {
    val: 2,
    description: 'span',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  3: {
    val: 3,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  4: {
    val: 4,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  5: {
    val: 5,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  6: {
    val: 6,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  7: {
    val: 7,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  8: {
    val: 8,
    description: 'maintenance',
    label: 'P',
    selectable: true,
    color: 'grey',
    color10: 'darkgrey',
    labelcolor: 'label-info'
  },
  9: {
    val: 9,
    description: 'offline',
    label: 'N',
    selectable: true,
    color: 'black',
    color10: 'black',
    labelcolor: 'label-default'
  }
};

channelHash = {
  RMY_WS: 1,
  RMY_WD: 2,
  TRH_Temp: 6,
  HMP60_Temp: 6,
  TRH_RH: 38,
  HMP60_RH: 38,
  O3_O3conc: 25,
  TEOM_MassConc: 43,
  TEOM_AmbTemp: 70,
  NOx_NOconc: 28,
  NOx_NO2conc: 29,
  NOx_NOxconc: 30,
  Rain_Precip: 8,
  Baro_Press: 9,
  CO_COconc: 27,
  SO_SO2conc: 26
};

unitsHash = {
  O3: 'pbbv',
  Conc: 'pbbv',
  conc: 'pbbv',
  NO: 'pbbv',
  NO2: 'pbbv',
  NOx: 'pbbv',
  WS: 'meter/second',
  WD: 'degree',
  Temp: 'degree C',
  RH: 'percent',
  MassConc: 'ugm3',
  AmbTemp: 'C'
};
