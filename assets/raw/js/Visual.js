/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render"] }] */

class Visual {

  constructor(config) {
    this.data = Visual.fetchData(config.data);
    this.attributes = config.attributes;
  }

  static fetchData(dataName) {
    return [{ data: 'This needs to be changed', name: dataName }];
  }

  renderControls() {
    throw new Error('You must implement this method');
  }

  render() {
    throw new Error('You must implement this method');
  }
}

Visual.RENDER_ID = 'visual';

export default Visual;
