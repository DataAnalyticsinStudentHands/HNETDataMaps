flagsHash = {
  0: {
    val: 0,
    description: 'zero',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
  },
  1: {
    val: 1,
    description: 'valid',
    label: 'K',
    selectable: true,
    color: '#BF0B23',
    color10: 'transparent',
    labelcolor: 'label-danger',
  },
  2: {
    val: 2,
    description: 'span',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning',
  },
  3: {
    val: 3,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning',
  },
  4: {
    val: 4,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning',
  },
  5: {
    val: 5,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning',
  },
  8: {
    val: 8,
    description: 'maintenance',
    label: 'P',
    selectable: true,
    color: 'grey',
    color10: 'darkgrey',
    labelcolor: 'label-default',
  },
  9: {
    val: 9,
    description: 'offline',
    label: 'N',
    selectable: true,
    color: 'black',
    color10: 'black',
    labelcolor: 'label-inverse',
  },
};

channelHash = {
  RMY_WS: 1,
  RMY_WD: 2,
  HMP60_Temp: 6,
  O3_conc: 25,
  '49i_O3': 25,
  HMP60_RH: 38,
  TEOM_PM25: 43,
  TEOM_Temp: 70,
  '42i_NO': 28,
  '42i_NO2': 29,
  '42i_NOx': 30,

  // precip_channel     =  8
  // press_channel       = 9
  // co_channel            =  27
  // so2_channel         = 26

};

unitsHash = {
  O3: 'pbbv',
  Conc: 'pbbv',
  NO: 'pbbv',
  NO2: 'pbbv',
  NOx: 'pbbv',
  WS: 'miles/hour',
  WD: 'degree',
  Temp: 'degree C',
  RH: 'percent',
  MassConc: 'ugm3',
  AmbTemp: 'C',
};
