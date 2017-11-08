import Visual from '../Visual';
import EditorGenerator from './helpers/EditorGenerator';

class Donut extends Visual {
  onLoadData() {
    let defaultCat = '';
    if (this.data.length > 0) {
      const cats = Object.keys(this.data[0]);
      if (cats.length > 1) {
        defaultCat = cats[1];
        console.log(`Using ${defaultCat}`);
      }
    }

    this.applyDefaultAttributes({
      width: 500,
      height: 500,
      font_size: 30,
      color: {
        mode: 'interpolate',
        colorspace: 'hcl',
        range: [0, 359],
      },
      label_mode: 'hover',
      category_order: '',
      group_by: defaultCat,
      title: '',
    });
  }

  renderControls() {
    if (this.data.length === 0) {
      alert('Dataset is empty!');
      return;
    }

    this.disableTransitions();

    Visual.empty(this.renderControlsID);
    const controlsContainer = document.getElementById(this.renderControlsID);

    const editor = new EditorGenerator(controlsContainer);

    editor.createHeader('Configure Donut Chart');

    editor.createTextField('donut-title', 'Donut Title', (e) => {
      this.attributes.title = $(e.currentTarget).val();
      this.render();
    });

    const cats = [];
    let catsRaw = Object.keys(this.getCategoricalData()[0]);
    catsRaw = catsRaw.concat(Object.keys(this.getNumericData()[0]));
    for (let i = 0; i < catsRaw.length; i += 1) {
      cats.push({ value: catsRaw[i], text: catsRaw[i] });
    }
    editor.createSelectBox('donut-column', 'Select column to display', cats, this.attributes.group_by,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.group_by = value;
       if (this.isNumeric(this.attributes.group_by)) {
         document.getElementById('bin-start').style.display = 'inherit';
         document.getElementById('bin-size').style.display = 'inherit';
       } else {
         document.getElementById('bin-start').style.display = 'none';
         document.getElementById('bin-size').style.display = 'none';
       }
       this.render();
     });

    editor.createTextField('bin-start', 'Low value of First Bin', (e) => {
      this.attributes.binStart = $(e.currentTarget).val();
      this.render();
    });
    editor.createTextField('bin-size', 'Bin Size', (e) => {
      this.attributes.binSize = $(e.currentTarget).val();
      this.render();
    });
    document.getElementById('bin-start').style.display = 'none';
    document.getElementById('bin-size').style.display = 'none';

    editor.createNumberSlider('donut-font-size',
     'Label Font Size',
      this.attributes.font_size,
       1, 60,
     (e) => {
       const value = $(e.currentTarget).val();
       this.attributes.font_size = `${value}`;
       this.render();
     });

    const displayModes = [
      { value: 'hover', text: 'On Hover' },
      { value: 'always', text: 'Always Visible' },
      { value: 'hidden', text: 'Hidden' }];
    editor.createSelectBox('donut-labelmode', 'Label Display', displayModes, this.attributes.label_mode,
      (e) => {
        const value = $(e.currentTarget).val();
        this.attributes.label_mode = value;
        this.render();
      });
  }

  render() {
    // Empty the container, then place the SVG in there
    Visual.empty(this.renderID);
    const width = this.attributes.width;
    const height = this.attributes.height;
    const radius = Math.min(width, height) / 2;
    let renderData = JSON.parse(JSON.stringify(this.data));
    if (this.isNumeric(this.attributes.group_by)) {
      renderData = this.makeBin(this.attributes.group_by, Number(this.attributes.binSize),
      Number(this.attributes.binStart));
    }
    const data = this.getGroupedListCounts(this.attributes.group_by, renderData);

    let colorspace = null;
    if (this.attributes.color.mode === 'interpolate') {
      const crange = this.attributes.color.range;
      const color = d3.scaleLinear().domain([0, data.length]).range([crange[0], crange[1]]);
      colorspace = function (n) {
        return d3.hcl(color(n), 100, 75).rgb();
      };
    } else {
      console.log('Error no color mode found');
    }

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(100);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    if (this.attributes.title !== '') {
      const title = d3.select(`#${this.renderID}`).append('h3')
        .attr('class', 'visual-title');
      title.html(this.attributes.title);
    }

    const svg = d3.select(`#${this.renderID}`).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'donut')
      .attr('viewBox', '0 0 500 500')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const g = svg.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc ');

    const tweenPie = function (b) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
      return function (t) { return arc(i(t)); };
    };
    const path = g.append('path')
      .style('fill', d => colorspace(d.index));

    if (this.useTransitions) {
      path.transition()
        .delay(500)
        .duration(700)
      	.attrTween('d', tweenPie);
    } else {
      path.attr('d', arc);
    }

    if (this.attributes.label_mode == 'hover') {
      const donut = this;
      const handleMouseOver = function (d, i) {
        let coordinates = [0, 0];
        coordinates = d3.mouse(this);

        d3.select('#donut-tooltip').remove();

        d3.select(this)
          .attr('fill-opacity', '0.5');

        const text = svg.append('text')
          .attr('id', 'donut-tooltip')
          .style('font-size', `${donut.attributes.font_size}pt`)
          .style('pointer-events', 'none')
          .text(d.data.key);
        if (coordinates[0] > 0) {
          text.attr('transform', `translate(${coordinates[0] - 5} ${coordinates[1]})`)
          .attr('text-anchor', 'end');
        } else {
          text.attr('transform', `translate(${coordinates[0] + 5} ${coordinates[1]})`)
          .attr('text-anchor', 'start');
        }
      };

      const handleMouseOut = function (d, i) {
        d3.select(this)
          .attr('fill-opacity', 1);
        d3.select('#donut-tooltip').remove();
      };

      path.on('mousemove', handleMouseOver)
          .on('mouseout', handleMouseOut);
    } else if (this.attributes.label_mode == 'always') {
      g.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('style', `font-size:${this.attributes.font_size}pt`)
        .attr('id', d => `label-${d.data.key}`)
        .text(d => d.data.key);
    }
  }
}

export default Donut;
