const nestedTreeMock = [
  {
    id: '1',
    children: [
      {
        id: '1.1',
        children: [
          {
            id: '1.1.1',
            children: []
          }
        ]
      },
    ]
  },
  {
    id: '2',
    children: [
      {
        id: '2.1',
        children: [],
      }, {
        id: '2.2',
        children: [],
      },
    ],
  }
]


const groupedActions = {
  "1": new Array(7).map(item => {}),
  "1.1.1": [{}, {}, {}],
  "2.1": [{}, {}, {}],
  "2.2": [{}, {}]
}

const getTaskAmountForId = (searchId, actionGroup) => {
  if (!actionGroup[searchId]) {
    return 0;
  }
  return actionGroup[searchId].length;
}

const getGlobalIndicesImperative = (treeArr, actionGroup) => {
  const globalIndices = {};

  const addToIndices = (id, total) => {
    globalIndices[id] = total;
  }

  const getCountsForAllChildren = (entry) => {
    const { children, id: rootId } = entry;

    const allChildrenAmount = children.reduce((total, currentChild) => {
      const totalForCurrentEntry = getTaskAmountForId(currentChild.id, actionGroup);

      if (!currentChild.children || !currentChild.children.length) {
        addToIndices(currentChild.id, totalForCurrentEntry);
        return total + totalForCurrentEntry;
      }

      const childCounts = getCountsForAllChildren(currentChild);
      const currentPlusChildren = childCounts + totalForCurrentEntry;
      addToIndices(currentChild.id, currentPlusChildren);
      return total + currentPlusChildren;
    }, 0);

    const rootTotal = allChildrenAmount + getTaskAmountForId(rootId, actionGroup);
    addToIndices(rootId, rootTotal);

    return rootTotal;
  }

  treeArr.forEach(entry => getCountsForAllChildren(entry));
  return globalIndices;
}

const results = getGlobalIndicesImperative(nestedTreeMock, groupedActions);

console.log('all output: ', JSON.stringify(results, null, 2));