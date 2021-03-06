import Loader from './visuals/helpers/Loader';
import Data from './visuals/helpers/Data';

function render(dataSets) {
  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

  const visualBlocks = document.createElement('div');
  visualBlocks.className = 'grid';

  const gridRow = document.createElement('div');
  gridRow.className = 'row';

  const selectionHeader = document.createElement('h2');
  selectionHeader.innerHTML = 'Please select a data set:';
  visualBlocks.appendChild(selectionHeader);

  visualBlocks.appendChild(gridRow);

  for (let i = 0; i < dataSets.length; i += 1) {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

    const block = document.createElement('div');
    block.className = 'block';

    const link = document.createElement('a');
    link.href = `/${dataSets[i].id}/`;

    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = dataSets[i].name;
    const image = document.createElement('object');
    image.data = `/assets/prod/images/datasets/${dataSets[i].id}.svg`;
    image.type = 'image/svg+xml';
    block.appendChild(image);
    block.appendChild(name);
    link.appendChild(block);
    col.appendChild(link);

    gridRow.appendChild(col);
  }

  page.appendChild(visualBlocks);
}

async function renderDatasetList() {
  const loader = new Loader('page');
  loader.render();
  Data.fetchDataSets((dataSets) => {
    loader.remove();
    render(dataSets);
  });
}

export default renderDatasetList;
