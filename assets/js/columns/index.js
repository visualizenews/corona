columns = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const updated = moment(data.generated).format(dateFormat.completeDateTime);
    const dayHeight = 18;
    const chartMargins = {
        s: [ 350, 0, 20, 55 ],
        m: [ 260, 50, 20, 75 ],
        l: [ 180, 50, 20, 75 ]
    };
    const curve = d3.curveCatmullRom.alpha(.5);
    const macroRegions = [ 'north', 'center', 'south' ];
    const macroRegionNorth = [ 'valle-d-aosta', 'piemonte', 'liguria', 'lombardia', 'trento', 'bolzano', 'veneto', 'friuli-venezia-giulia', 'emilia-romagna' ];
    const macroRegionCenter = [ 'toscana', 'lazio', 'umbria', 'marche' ];
    const macroRegionSouth = [ 'abruzzo', 'molise', 'campania', 'basilicata', 'puglia', 'sicilia', 'sardegna', 'calabria' ];
    const enddate = '2021-12-31';
    const startDate = '2020-02-24';
    let chartDataComplete = {};
    let chartDataMarcoregions = {};
    let chartData = {};
    const regionsProperties = {};
    const macroRegionsProperties = {};
    let labelsProperties = {};
    let selectedDomain = '';
    let selectedIndex = '';
    const legend = [
        {
            symbol: 'cases',
            title: toLocalText('cases'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
        {
            symbol: 'newCases',
            title: toLocalText('newCases'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
        {
            symbol: 'activeCases',
            title: toLocalText('activeCases'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
        {
            symbol: 'deaths',
            title: toLocalText('fatalities'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
        {
            symbol: 'hospital',
            title: toLocalText('hospitalized'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
        {
            symbol: 'icu',
            title: toLocalText('inICU'),
            buttons: [
                {
                    class: 'hundreds',
                    label: '100',
                    show: false,
                },
                {
                    class: 'thousands',
                    label: '1000',
                    show: false,
                },
                {
                    class: 'tenthousands',
                    label: '10000',
                    show: false,
                },
                {
                    class: 'hundredthousands',
                    label: '100000',
                    show: false,
                },
            ]
        },
    ];

    const reset = () => {
        if (window.matchMedia('screen and (min-width:768px)').matches) {
            chartData = JSON.parse(JSON.stringify(chartDataComplete));
            labelsProperties = JSON.parse(JSON.stringify(regionsProperties));
        } else {
            chartData = JSON.parse(JSON.stringify(chartDataMarcoregions));
            labelsProperties = JSON.parse(JSON.stringify(macroRegionsProperties));
        }
        const chartContainer = document.querySelector('#columns-wrapper');
        chartContainer.innerHTML = '';
        drawLines();
        if (selectedDomain !== '' && selectedIndex !== '') {
            addDayCounters(selectedDomain, selectedIndex);
        }
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        const indexesTemplate = {
            cases: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
            activeCases: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
            newCases: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
            deaths: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
            hospital: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
            icu: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                hundredthousands: false,
            },
        };
        let indexes = {
            italy: JSON.parse(JSON.stringify(indexesTemplate)),
        };
        const regions = [
            "lombardia",
            "veneto",
            "emilia-romagna",
            "piemonte",
            "marche",
            "toscana",
            "trento",
            "liguria",
            "lazio",
            "campania",
            "puglia",
            "friuli-venezia-giulia",
            "sicilia",
            "abruzzo",
            "umbria",
            "bolzano",
            "valle-d-aosta",
            "sardegna",
            "calabria",
            "basilicata",
            "molise",
        ];
        
        regions.forEach( r => indexes[r] = JSON.parse(JSON.stringify(indexesTemplate)) );
        macroRegions.forEach( m => indexes[m] = JSON.parse(JSON.stringify(indexesTemplate)) );
        // Italy
        data.italy.global.forEach((d, i) => {
            if (d.datetime <= enddate) {
                chartDataComplete[d.datetime] = {
                    datetime: d.datetime,
                    data: {
                        italy: (() => {
                            const result = [];
                            // Cases
                            if (!indexes.italy.cases.hundreds && d.cases >= 100 ) {
                                indexes.italy.cases.hundreds = true;
                                legend[0].buttons[0].show = true;
                                result.push({ domain: 'cases', index: 'hundreds', datetime: d.datetime, data: d, });                            
                            }
                            if (!indexes.italy.cases.thousands && d.cases >= 1000 ) {
                                indexes.italy.cases.thousands = true;
                                legend[0].buttons[1].show = true;
                                result.push({ domain: 'cases', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.cases.tenthousands && d.cases >= 10000 ) {
                                indexes.italy.cases.tenthousands = true;
                                legend[0].buttons[2].show = true;
                                result.push({ domain: 'cases', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.cases.hundredthousands && d.cases >= 100000 ) {
                                indexes.italy.cases.hundredthousands = true;
                                legend[0].buttons[3].show = true;
                                result.push({ domain: 'cases', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            // ActiveCases
                            if (!indexes.italy.activeCases.hundreds && (d.cases - d.recovered - d.deaths) >= 100 ) {
                                indexes.italy.activeCases.hundreds = true;
                                legend[2].buttons[0].show = true;
                                result.push({ domain: 'activeCases', index: 'hundreds', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.activeCases.thousands && (d.cases - d.recovered - d.deaths) >= 1000 ) {
                                indexes.italy.activeCases.thousands = true;
                                legend[2].buttons[1].show = true;
                                result.push({ domain: 'activeCases', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.activeCases.tenthousands && (d.cases - d.recovered - d.deaths) >= 10000 ) {
                                indexes.italy.activeCases.tenthousands = true;
                                legend[2].buttons[2].show = true;
                                result.push({ domain: 'activeCases', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.activeCases.hundredthousands && (d.cases - d.recovered - d.deaths) >= 100000 ) {
                                indexes.italy.activeCases.hundredthousands = true;
                                legend[2].buttons[3].show = true;
                                result.push({ domain: 'activeCases', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            // NewCases
                            if (!indexes.italy.newCases.hundreds && d.new_tested_positive >= 100 ) {
                                indexes.italy.newCases.hundreds = true;
                                legend[1].buttons[0].show = true;
                                result.push({ domain: 'newCases', index: 'hundreds', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.newCases.thousands && d.new_tested_positive >= 1000 ) {
                                indexes.italy.newCases.thousands = true;
                                legend[1].buttons[1].show = true;
                                result.push({ domain: 'newCases', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.newCases.tenthousands && d.new_tested_positive >= 10000 ) {
                                indexes.italy.newCases.tenthousands = true;
                                legend[1].buttons[2].show = true;
                                result.push({ domain: 'newCases', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.newCases.hundredthousands && d.new_tested_positive >= 100000 ) {
                                indexes.italy.newCases.hundredthousands = true;
                                legend[1].buttons[3].show = true;
                                result.push({ domain: 'newCases', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            // Deaths
                            if (!indexes.italy.deaths.hundreds && d.deaths >= 100 ) {
                                indexes.italy.deaths.hundreds = true;
                                legend[3].buttons[0].show = true;
                                result.push({ domain: 'deaths', index: 'hundreds', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.deaths.thousands && d.deaths >= 1000 ) {
                                indexes.italy.deaths.thousands = true;
                                legend[3].buttons[1].show = true;
                                result.push({ domain: 'deaths', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.deaths.tenthousands && d.deaths >= 10000 ) {
                                indexes.italy.deaths.tenthousands = true;
                                legend[3].buttons[2].show = true;
                                result.push({ domain: 'deaths', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.deaths.hundredthousands && d.deaths >= 100000 ) {
                                indexes.italy.deaths.hundredthousands = true;
                                legend[3].buttons[3].show = true;
                                result.push({ domain: 'deaths', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            // Hospital
                            if (!indexes.italy.hospital.hundreds && d.hospital >= 100 ) {
                                indexes.italy.hospital.hundreds = true;
                                legend[4].buttons[0].show = true;
                                result.push({ domain: 'hospital', index: 'hundreds', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.hospital.thousands && d.hospital >= 1000 ) {
                                indexes.italy.hospital.thousands = true;
                                legend[4].buttons[1].show = true;
                                result.push({ domain: 'hospital', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.hospital.tenthousands && d.hospital >= 10000 ) {
                                indexes.italy.hospital.tenthousands = true;
                                legend[4].buttons[2].show = true;
                                result.push({ domain: 'hospital', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.hospital.hundredthousands && d.hospital >= 100000 ) {
                                indexes.italy.hospital.hundredthousands = true;
                                legend[4].buttons[3].show = true;
                                result.push({ domain: 'hospital', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            // ICU
                            if (!indexes.italy.icu.hundreds && d.icu >= 100 ) {
                                indexes.italy.icu.hundreds = true;
                                legend[5].buttons[0].show = true;
                                result.push({ domain: 'icu', index: 'hundreds', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.icu.thousands && d.icu >= 1000 ) {
                                indexes.italy.icu.thousands = true;
                                legend[5].buttons[1].show = true;
                                result.push({ domain: 'icu', index: 'thousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.icu.tenthousands && d.icu >= 10000 ) {
                                indexes.italy.icu.tenthousands = true;
                                legend[5].buttons[2].show = true;
                                result.push({ domain: 'icu', index: 'tenthousands', datetime: d.datetime, data: d, });
                            }
                            if (!indexes.italy.icu.hundredthousands && d.icu >= 100000 ) {
                                indexes.italy.icu.hundredthousands = true;
                                legend[5].buttons[3].show = true;
                                result.push({ domain: 'icu', index: 'hundredthousands', datetime: d.datetime, data: d, });
                            }
                            return result;
                        })(),
                    }
                }
            }
        });
        chartDataMarcoregions = JSON.parse(JSON.stringify(chartDataComplete));
        // Regions
        data.italy.regions.forEach((d,i) => {
            regions.forEach(r => {
                if (d.datetime <= enddate) {
                    chartDataComplete[d.datetime].data[r] = (() => {
                        const result = [];
                        if (!regionsProperties[r]) {
                            regionsProperties[r] = [];
                        }
                        // Cases
                        if (!indexes[r].cases.hundreds && d.data[r].cases >= 100 ) {
                            indexes[r].cases.hundreds = true;
                            result.push({ domain: 'cases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'cases', index: 'hundreds' });
                        }
                        if (!indexes[r].cases.thousands && d.data[r].cases >= 1000 ) {
                            indexes[r].cases.thousands = true;
                            result.push({ domain: 'cases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'cases', index: 'thousands' });
                        }
                        if (!indexes[r].cases.tenthousands && d.data[r].cases >= 10000 ) {
                            indexes[r].cases.tenthousands = true;
                            result.push({ domain: 'cases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'cases', index: 'tenthousands' });
                        }
                        if (!indexes[r].cases.hundredthousands && d.data[r].cases >= 100000 ) {
                            indexes[r].cases.hundredthousands = true;
                            result.push({ domain: 'cases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'cases', index: 'hundredthousands' });
                        }
                        // ActiveCases
                        if (!indexes[r].activeCases.hundreds && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 100 ) {
                            indexes[r].activeCases.hundreds = true;
                            result.push({ domain: 'activeCases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'activeCases', index: 'hundreds' });
                        }
                        if (!indexes[r].activeCases.thousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 1000 ) {
                            indexes[r].activeCases.thousands = true;
                            result.push({ domain: 'activeCases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'activeCases', index: 'thousands' });
                        }
                        if (!indexes[r].activeCases.tenthousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 10000 ) {
                            indexes[r].activeCases.tenthousands = true;
                            result.push({ domain: 'activeCases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'activeCases', index: 'tenthousands' });
                        }
                        if (!indexes[r].activeCases.hundredthousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 100000 ) {
                            indexes[r].activeCases.hundredthousands = true;
                            result.push({ domain: 'activeCases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'activeCases', index: 'hundredthousands' });
                        }
                        // NewCases
                        if (!indexes[r].newCases.hundreds && d.data[r].new_tested_positive >= 100 ) {
                            indexes[r].newCases.hundreds = true;
                            result.push({ domain: 'newCases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'newCases', index: 'hundreds' });
                        }
                        if (!indexes[r].newCases.thousands && d.data[r].new_tested_positive >= 1000 ) {
                            indexes[r].newCases.thousands = true;
                            result.push({ domain: 'newCases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'newCases', index: 'thousands' });
                        }
                        if (!indexes[r].newCases.tenthousands && d.data[r].new_tested_positive >= 10000 ) {
                            indexes[r].newCases.tenthousands = true;
                            result.push({ domain: 'newCases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'newCases', index: 'tenthousands' });
                        }
                        if (!indexes[r].newCases.hundredthousands && d.data[r].new_tested_positive >= 100000 ) {
                            indexes[r].newCases.hundredthousands = true;
                            result.push({ domain: 'newCases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'newCases', index: 'hundredthousands' });
                        }
                        // Deaths
                        if (!indexes[r].deaths.hundreds && d.data[r].deaths >= 100 ) {
                            indexes[r].deaths.hundreds = true;
                            result.push({ domain: 'deaths', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'deaths', index: 'hundreds' });
                        }
                        if (!indexes[r].deaths.thousands && d.data[r].deaths >= 1000 ) {
                            indexes[r].deaths.thousands = true;
                            result.push({ domain: 'deaths', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'deaths', index: 'thousands' });
                        }
                        if (!indexes[r].deaths.tenthousands && d.data[r].deaths >= 10000 ) {
                            indexes[r].deaths.tenthousands = true;
                            result.push({ domain: 'deaths', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'deaths', index: 'tenthousands' });
                        }
                        if (!indexes[r].deaths.hundredthousands && d.data[r].deaths >= 100000 ) {
                            indexes[r].deaths.hundredthousands = true;
                            result.push({ domain: 'deaths', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'deaths', index: 'hundredthousands' });
                        }
                        // Hospital
                        if (!indexes[r].hospital.hundreds && d.data[r].hospital >= 100 ) {
                            indexes[r].hospital.hundreds = true;
                            result.push({ domain: 'hospital', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'hospital', index: 'hundreds' });
                        }
                        if (!indexes[r].hospital.thousands && d.data[r].hospital >= 1000 ) {
                            indexes[r].hospital.thousands = true;
                            result.push({ domain: 'hospital', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'hospital', index: 'thousands' });
                        }
                        if (!indexes[r].hospital.tenthousands && d.data[r].hospital >= 10000 ) {
                            indexes[r].hospital.tenthousands = true;
                            result.push({ domain: 'hospital', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'hospital', index: 'tenthousands' });
                        }
                        if (!indexes[r].hospital.hundredthousands && d.data[r].hospital >= 100000 ) {
                            indexes[r].hospital.hundredthousands = true;
                            result.push({ domain: 'hospital', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'hospital', index: 'hundredthousands' });
                        }
                        // ICU
                        if (!indexes[r].icu.hundreds && d.data[r].icu >= 100 ) {
                            indexes[r].icu.hundreds = true;
                            result.push({ domain: 'icu', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'icu', index: 'hundreds' });
                        }
                        if (!indexes[r].icu.thousands && d.data[r].icu >= 1000 ) {
                            indexes[r].icu.thousands = true;
                            result.push({ domain: 'icu', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'icu', index: 'thousands' });
                        }
                        if (!indexes[r].icu.tenthousands && d.data[r].icu >= 10000 ) {
                            indexes[r].icu.tenthousands = true;
                            result.push({ domain: 'icu', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'icu', index: 'tenthousands' });
                        }
                        if (!indexes[r].icu.hundredthousands && d.data[r].icu >= 100000 ) {
                            indexes[r].icu.hundredthousands = true;
                            result.push({ domain: 'icu', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                            regionsProperties[r].push({ domain: 'icu', index: 'hundredthousands' });
                        }
                        return result;
                    })();
                }
            });
        });
        // MacroRegions
        data.italy.regions.forEach((d,i) => {
            regions.forEach(r => {
                if (d.datetime <= enddate) {
                    let macroRegion = 'north';
                    if (macroRegionSouth.indexOf(r) !== -1) {
                        macroRegion = 'south';
                    }
                    if (macroRegionCenter.indexOf(r) !== -1) {
                        macroRegion = 'center';
                    }
                    if (!chartDataMarcoregions[d.datetime].data[macroRegion]) {
                        chartDataMarcoregions[d.datetime].data[macroRegion] = [];
                    }
                    const result = [];
                    if (!macroRegionsProperties[macroRegion]) {
                        macroRegionsProperties[macroRegion] = [];
                    }
                    // Cases
                    if (!indexes[macroRegion].cases.hundreds && d.data[r].cases >= 100 ) {
                        indexes[macroRegion].cases.hundreds = true;
                        result.push({ domain: 'cases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'cases', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].cases.thousands && d.data[r].cases >= 1000 ) {
                        indexes[macroRegion].cases.thousands = true;
                        result.push({ domain: 'cases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'cases', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].cases.tenthousands && d.data[r].cases >= 10000 ) {
                        indexes[macroRegion].cases.tenthousands = true;
                        result.push({ domain: 'cases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'cases', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].cases.hundredthousands && d.data[r].cases >= 100000 ) {
                        indexes[macroRegion].cases.hundredthousands = true;
                        result.push({ domain: 'cases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'cases', index: 'hundredthousands' });
                    }
                    // ActiveCases
                    if (!indexes[macroRegion].activeCases.hundreds && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 100 ) {
                    indexes[macroRegion].activeCases.hundreds = true;
                    result.push({ domain: 'activeCases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                    macroRegionsProperties[macroRegion].push({ domain: 'activeCases', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].activeCases.thousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 1000 ) {
                        indexes[macroRegion].activeCases.thousands = true;
                        result.push({ domain: 'activeCases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'activeCases', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].activeCases.tenthousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 10000 ) {
                        indexes[macroRegion].activeCases.tenthousands = true;
                        result.push({ domain: 'activeCases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'activeCases', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].activeCases.hundredthousands && (d.data[r].cases - d.data[r].recovered - d.data[r].deaths) >= 100000 ) {
                        indexes[macroRegion].activeCases.hundredthousands = true;
                        result.push({ domain: 'activeCases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'activeCases', index: 'hundredthousands' });
                    }
                    // NewCases
                    if (!indexes[macroRegion].newCases.hundreds && d.data[r].new_tested_positive >= 100 ) {
                        indexes[macroRegion].newCases.hundreds = true;
                        result.push({ domain: 'newCases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'newCases', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].newCases.thousands && d.data[r].new_tested_positive >= 1000 ) {
                        indexes[macroRegion].newCases.thousands = true;
                        result.push({ domain: 'newCases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'newCases', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].newCases.tenthousands && d.data[r].new_tested_positive >= 10000 ) {
                        indexes[macroRegion].newCases.tenthousands = true;
                        result.push({ domain: 'newCases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'newCases', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].newCases.hundredthousands && d.data[r].new_tested_positive >= 100000 ) {
                        indexes[macroRegion].newCases.hundredthousands = true;
                        result.push({ domain: 'newCases', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'newCases', index: 'hundredthousands' });
                    }
                    // Deaths
                    if (!indexes[macroRegion].deaths.hundreds && d.data[r].deaths >= 100 ) {
                        indexes[macroRegion].deaths.hundreds = true;
                        result.push({ domain: 'deaths', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'deaths', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].deaths.thousands && d.data[r].deaths >= 1000 ) {
                        indexes[macroRegion].deaths.thousands = true;
                        result.push({ domain: 'deaths', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'deaths', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].deaths.tenthousands && d.data[r].deaths >= 10000 ) {
                        indexes[macroRegion].deaths.tenthousands = true;
                        result.push({ domain: 'deaths', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'deaths', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].deaths.hundredthousands && d.data[r].deaths >= 100000 ) {
                        indexes[macroRegion].deaths.hundredthousands = true;
                        result.push({ domain: 'deaths', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'deaths', index: 'hundredthousands' });
                    }
                    // Hospital
                    if (!indexes[macroRegion].hospital.hundreds && d.data[r].hospital >= 100 ) {
                        indexes[macroRegion].hospital.hundreds = true;
                        result.push({ domain: 'hospital', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'hospital', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].hospital.thousands && d.data[r].hospital >= 1000 ) {
                        indexes[macroRegion].hospital.thousands = true;
                        result.push({ domain: 'hospital', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'hospital', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].hospital.tenthousands && d.data[r].hospital >= 10000 ) {
                        indexes[macroRegion].hospital.tenthousands = true;
                        result.push({ domain: 'hospital', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'hospital', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].hospital.hundredthousands && d.data[r].hospital >= 100000 ) {
                        indexes[macroRegion].hospital.hundredthousands = true;
                        result.push({ domain: 'hospital', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'hospital', index: 'hundredthousands' });
                    }
                    // ICU
                    if (!indexes[macroRegion].icu.hundreds && d.data[r].icu >= 100 ) {
                        indexes[macroRegion].icu.hundreds = true;
                        result.push({ domain: 'icu', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'icu', index: 'hundreds' });
                    }
                    if (!indexes[macroRegion].icu.thousands && d.data[r].icu >= 1000 ) {
                        indexes[macroRegion].icu.thousands = true;
                        result.push({ domain: 'icu', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'icu', index: 'thousands' });
                    }
                    if (!indexes[macroRegion].icu.tenthousands && d.data[r].icu >= 10000 ) {
                        indexes[macroRegion].icu.tenthousands = true;
                        result.push({ domain: 'icu', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'icu', index: 'tenthousands' });
                    }
                    if (!indexes[macroRegion].icu.hundredthousands && d.data[r].icu >= 100000 ) {
                        indexes[macroRegion].icu.hundredthousands = true;
                        result.push({ domain: 'icu', index: 'hundredthousands', datetime: d.datetime, data: d.data[r], });
                        macroRegionsProperties[macroRegion].push({ domain: 'icu', index: 'hundredthousands' });
                    }
                    chartDataMarcoregions[d.datetime].data[macroRegion] = chartDataMarcoregions[d.datetime].data[macroRegion].concat(result);
                }
            });
        });
    }

    const removeDayCounters = () => {
        const $counters = $container.querySelectorAll('.columns-day-counter');
        $counters.forEach(c => {
            c.parentNode.removeChild(c);
        });
    }

    const addDayCounters = (domain, index) => {
        const $lines = $container.querySelectorAll(`.columns-grid-day-${domain}-${index}`);
        if ($lines.length > 1) {
            const base = parseInt($lines[0].getAttribute('y1'));
            let prevDistance = 0;
            $lines.forEach((l, i) => {
                const thisDay = parseInt(l.getAttribute('y1'));
                const distance = Math.floor((thisDay - base) / dayHeight);
                if (distance > 1) {
                    if (distance - prevDistance > 1) {
                        prevDistance = distance;
                        const div = document.createElement('div');
                        div.className = 'columns-day-counter';
                        div.style.top = `${thisDay}px`;
                        div.innerHTML = `+${distance}d`;
                        $container.querySelector('#columns-wrapper').appendChild(div);
                    }
                }
            });
        }
    }

    const showDomainIndex = (domain, index) => {
        removeDayCounters();
        if ($container.classList.contains(`active-${domain}-${index}`)) {
            $container.classList.remove(`active-${domain}-${index}`);
            selectedDomain = '';
            selectedIndex = '';
        } else {
            selectedDomain = domain;
            selectedIndex = index;
            $container.classList.forEach(className => {
                if (className.startsWith('active-')) {
                    $container.classList.remove(className);
                }
            });
            $container.classList.add(`active-${domain}-${index}`);
            addDayCounters(domain, index);
        }
    }

    const drawLines = () => {
        const keys = Object.keys(chartData);
        const regions = Object.keys(chartData[keys[0]].data);
        const width = $container.offsetWidth;
        let margins = chartMargins.s;
        let localDateFormat = dateFormat.minimal;
        if (window.matchMedia('(min-width: 1280px)').matches) {
            margins = chartMargins.l;
            localDateFormat = dateFormat.shortDayOfTheWeek;
        } else if (window.matchMedia('(min-width: 768px)').matches) {
            margins = chartMargins.m;
        }
        const height = dayHeight * keys.length + margins[0] + margins[2];
        const colWidth = Math.floor((width - margins[1] - margins[3]) / regions.length);
        const hDistance = colWidth / 2;
        const vDistance = dayHeight / 2;
        const linePoints = {};

        const $chartWrapper = d3.select('#columns-wrapper');
        const $svg = $chartWrapper
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewbox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        // Grid
        const $grid = $svg.append('g');
        const $connectors = $svg.append('g');
        const $regions = $svg.append('g');

        const tooltip = Tooltip($container, id);

        // Hgrid
        keys.forEach((d, i) => {
            const y = margins[0] + i * dayHeight + vDistance;
            const classNames = [];
            regions.forEach(r => {
                if (chartData[d].data[r].length > 0) {
                    chartData[d].data[r].forEach(
                        c => classNames.push(`columns-grid-day-${c.domain} columns-grid-day-${c.domain}-${c.index}`)
                    );
                }
            });
            $grid
                .append('line')
                .attr('x1', margins[3])
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', `columns-grid-day columns-grid-day-${i} ${classNames.join(' ')}`)
        });
        // Vgrid
        regions.forEach((r, i) => {
            const x = margins[3] + (i * colWidth + hDistance);
            let classes = '';
            if (r !== 'italy') {
                labelsProperties[r].forEach(l => classes += `columns-grid-region-${l.domain}-${l.index} `);
            }
            $grid
                .append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', margins[0])
                .attr('y2', height - margins[2] - vDistance)
                .attr('class', `columns-grid-region columns-grid-region-${i} ${classes}`)

        });

        // Points & Lines
        regions.forEach((r, i) => {
            const $region = $regions.append('g')
                .attr('class', `columns-data-region columns-data-region-${i} columns-data-region-${r}`);
            $region.append('rect')
                .attr('x', margins[3] + i * colWidth)
                .attr('y', margins[0])
                .attr('width', colWidth)
                .attr('height', height - margins[0] - margins[2] - vDistance)
                .attr('class', `columns-data-region-ghost columns-data-region-ghost-${i} columns-data-region-ghost-${r}`);
            keys.forEach((d, j) => {
                // Lines
                if (chartData[d].data[r].length > 0) {
                    chartData[d].data[r].forEach((c, k) => {
                        if (!linePoints[c.domain]) {
                            linePoints[c.domain] = {};
                        }
                        if (!linePoints[c.domain][c.index]) {
                            linePoints[c.domain][c.index] = [];
                        }
                        linePoints[c.domain][c.index].push( { x: (margins[3] + (i * colWidth + hDistance)), y: ((j * dayHeight) + vDistance + margins[0]) } );
                    });
                }
                // Points
                if (chartData[d].data[r].length > 0) {
                    const positions = [];
                    if (chartData[d].data[r].length > 3) {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                x: (() => {
                                    let x = (margins[3] + (i * colWidth + hDistance));
                                    if (k === 0 || k === 2) {
                                        return x - 6;
                                    }
                                    return x + 6;
                                })(),
                                y: (() => {
                                    let y = (j * dayHeight) + vDistance + margins[0];
                                    if (k === 0 || k === 1) {
                                        return y - 6;
                                    }
                                    return y + 6;
                                })(),
                                domain: c.domain,
                                index: c.index,
                                data: c.data,
                                k,
                            });
                        })
                    } else  if (chartData[d].data[r].length > 2) {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                x: (() => {
                                    let x = (margins[3] + (i * colWidth + hDistance));
                                    if (k === 1) {
                                        return x - 6;
                                    } else if (k === 2) {
                                        return x + 6;
                                    }
                                    return x;
                                })(),
                                y: (() => {
                                    let y = (j * dayHeight) + vDistance + margins[0];
                                    if (k === 0) {
                                        return y - 6;
                                    }
                                    return y + 6;
                                })(),
                                domain: c.domain,
                                index: c.index,
                                data: c.data,
                                k,
                            });
                        })
                    } else if (chartData[d].data[r].length > 1) {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                x: (() => {
                                    let x = (margins[3] + (i * colWidth + hDistance));
                                    if (k === 1) {
                                        return x - 6;
                                    }
                                    return x + 6;
                                })(),
                                y: (() => {
                                    let y = (j * dayHeight) + vDistance + margins[0];
                                    return y;
                                })(),
                                domain: c.domain,
                                index: c.index,
                                data: c.data,
                                k,
                            });
                        });
                    } else {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                x: margins[3] + (i * colWidth + hDistance),
                                y: j * dayHeight + vDistance + margins[0],
                                domain: c.domain,
                                index: c.index,
                                data: c.data,
                                k,
                            });
                        });
                    }
                    if (chartData[d].data[r].length > 1) {
                        $region.append('circle')
                            .attr('class', 'columns-data-region-point-wrapper')
                            .attr('cx', margins[3] + (i * colWidth + hDistance))
                            .attr('cy', j * dayHeight + vDistance + margins[0])
                            .attr('r', 10);
                    }
                    positions.forEach(p => {
                        $region.append('use')
                            .attr('x', p.x)
                            .attr('y', p.y)
                            .attr('xlink:href', `#${p.domain}`)
                            .attr('class', `columns-data-region-point columns-data-region-point-${i}-${j} columns-data-region-point-${i}-${j}-${p.k} columns-data-region-point-${p.domain} columns-data-region-point-${p.domain}-${p.index}`)
                            .attr('title', `${r}`)
                            .on('click', () => showDomainIndex(p.domain, p.index))
                            .on("mouseover", () => {
                                tooltip.show(
                                    `<div class="columns-tooltip">
                                        <h4>${moment(startDate).add(j, 'day').format(dateFormat.short)}</h4>
                                        <h3>${regionsLabels[r]}</h3>
                                        <p>${toLocalText('reached', {
                                            number: (() => {
                                                switch(p.index) {
                                                    case 'hundreds':
                                                        return d3.format(numberFormat.thousands)(100);
                                                    case 'thousands':
                                                        return d3.format(numberFormat.thousands)(1000);
                                                    case 'tenthousands':
                                                        return d3.format(numberFormat.thousands)(10000);
                                                    case 'hundredthousands':
                                                        return d3.format(numberFormat.thousands)(100000);
                                                }
                                            })(),
                                            domain: toLocalText(
                                                (() => { 
                                                    if (p.domain === 'hospital') {
                                                        return 'hospitalized';
                                                    } else if (p.domain === 'icu') {
                                                        return 'inICU';
                                                    }
                                                    return p.domain
                                                })()
                                            )
                                        })}.</p>
                                    </div>`,
                                    p.x,
                                    p.y,
                                    (p.x > window.innerWidth * .7) ? 'top-right' : 'top-center',
                                    'light'
                                );
                            })
                            .on("mouseout", () => { tooltip.hide(); });
                    })
                }
            });
        });

        const domains = Object.keys(linePoints);
        domains.forEach((d, i) => {
            const $connector = $connectors.append('g')
                .attr('class', `columns-data-connectors-${d}`);
            const indexes = Object.keys(linePoints[d]);
            indexes.forEach((idx, j) => {
                if (linePoints[d][idx].length > 1) {
                    $connector.append('path')
                        .datum(linePoints[d][idx])
                        .attr('class', dt => `columns-data-connector columns-data-connector-${d} columns-data-connector-${d}-${idx}`)
                        .attr('fill', 'none')
                        .attr('d', d3.line()
                            .curve(curve)
                            .x(dt => dt.x)
                            .y(dt => dt.y));
                }
            });
        });

        // Labels
        regions.forEach((r, i) => {
            let classes = '';
            if (r !== 'italy') {
                labelsProperties[r].forEach(l => classes += `columns-data-top-label-${l.domain}-${l.index} `);
            }
            $chartWrapper
                .append('div')
                .html(regionsShortLabels[r])
                .attr('style', `left: ${margins[3] + (i * colWidth + hDistance)}px;`)
                .attr('class', `columns-data-top-label columns-data-top-label-${r} ${classes}`);
        });

        // Date Labels
        keys.forEach((d, i) => {
            let show = false;
            const classNames = [];
            regions.forEach(r => {
                if (chartData[d].data[r].length > 0) {
                    show = true;
                    chartData[d].data[r].forEach(
                        c => classNames.push(`columns-data-date-label-${c.domain} columns-data-date-label-${c.domain}-${c.index}`)
                    );
                }
            });
            if (show) {
                $chartWrapper
                    .append('div')
                    .html(moment(chartData[d].datetime).format(localDateFormat))
                    .attr('style', `top: ${margins[0] + i * dayHeight}px;`)
                    .attr('class', (() => {
                        let className = `columns-data-date-label columns-data-date-label-${i} `;
                        className += classNames.join(' ');
                        return className;
                    })());
            }
        });

        // Legend
        const $legend = $chartWrapper
            .append('div')
            .attr('class', 'columns-data-legend');

        legend.forEach(l => {
            const $box = $legend
                .append('div')
                .attr('class', 'colunms-data-legend-box');
            const $boxTitle = $box
                .append('div')
                .attr('class', 'colunms-data-legend-box-title');
            $boxTitle
                .append('div')
                .attr('class', 'columns-data-legend-symbol')
                    .append('svg')
                    .attr('width', 16)
                    .attr('height', 16)
                    .attr('viewbox', '0 0 16 16')
                    .attr('preserveAspectRatio', 'xMidYMid meet')
                        .append('use')
                            .attr('x', 8)
                            .attr('y', 8)
                            .attr('xlink:href', `#${l.symbol}`)
                            .attr('class', 'columns-data-legend-symbol-svg');
            $boxTitle.append('div')
                .attr('class', 'columns-data-legend-title')
                .text(l.title);
            $buttons = $box.append('div')
                .attr('class','columns-data-legend-buttons');
            l.buttons.forEach(b => {
                if (b.show) {
                    $buttons.append('button')
                        .attr('class', `columns-data-legend-button columns-data-legend-button-${b.class} columns-data-legend-button-${l.symbol}-${b.class}`)
                        .text(`${d3LocaleFormat.format(numberFormat.thousands)(b.label)}+`)
                        .on('click', () => showDomainIndex(l.symbol, b.class));
                }
            });
        });
    }

    let html = `<div class="columns">
        <div class="columns-wrapper" id="columns-wrapper">
            
        </div>
        <p class="columns-update last-update">${toLocalText('lastUpdate')}: ${updated}.</p>
        <div class="columns-hidden">
            <svg heigh="0" width="0">
                <defs>
                    <circle id="cases" cx="0" cy="0" r="4" />
                    <rect id="newCases" x="-4" y="-4" width="8" height="8" />
                    <rect id="activeCases" x="-4" y="-4" width="8" height="8" transform="rotate(45)"/>
                    <path id="deaths" d="M1.83333 -5.5H-1.83333V-1.83332L-5.5 -1.83332V1.83334H-1.83333V5.5H1.83333V1.83334H5.5V-1.83332L1.83333 -1.83332V-5.5Z" />
                    <path id="icu" d="M1.83333 -5.5H-1.83333V-1.83332L-5.5 -1.83332V1.83334H-1.83333V5.5H1.83333V1.83334H5.5V-1.83332L1.83333 -1.83332V-5.5Z" transform="rotate(45)" />
                    <path id="hospital" d="M0 -5L4.33013 3.4375H-4.33013L0 -5Z" />
                </defs>
            </svg>
        </div>
    </div>`;
    
    $container.innerHTML = html;
    prepareData();
    window.addEventListener('resize', reset.bind(this));
    reset();
    showDomainIndex('cases','tenthousands');
}
