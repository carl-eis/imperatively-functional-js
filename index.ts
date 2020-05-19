interface IListEntry {
  id: string;
  children: IListEntry[];
  task?: any[];
}

const nestedTreeMock: IListEntry[] = [
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


export const groupedActions = {
  "1": new Array(7).map(item => {}),
  "1.1.1": [{}, {}, {}],
  "2.1": [{}, {}, {}],
  "2.2": [{}, {}]
}

const getTaskAmountForId = (searchId: string): number => {
  if (!groupedActions[searchId]) {
    return 0;
  }
  return groupedActions[searchId].length;
}


interface IAggregatedCountIndices {
  total: number;
  indices: {
    [x: string]: number;
  };
}


const getCountsForAllChildren = (entry: IListEntry): IAggregatedCountIndices => {
  const { children, id: rootId } = entry;

  const allChildIndices = children.reduce((accumulator: IAggregatedCountIndices, currentChild: IListEntry) => {
    if (currentChild.children && currentChild.children.length) {
      const childCounts = getCountsForAllChildren(currentChild);
      return {
        total: accumulator.total + childCounts.total,
        indices: {
          ...childCounts.indices,
          [currentChild.id]: childCounts.total + getTaskAmountForId(currentChild.id), // if tasks at all levels
        }
      } as IAggregatedCountIndices;
    } else {
      const totalForCurrentEntry: number = getTaskAmountForId(currentChild.id);

      return {
        total: accumulator.total + totalForCurrentEntry,
        indices: {
          ...accumulator.indices,
          [currentChild.id]: totalForCurrentEntry
        }
      } as IAggregatedCountIndices;
    }
  }, {
    total: 0,
    indices: {},
  } as IAggregatedCountIndices);

  return {
    total: allChildIndices.total,
    indices: {
      ...allChildIndices.indices,
      [rootId]: allChildIndices.total + getTaskAmountForId(rootId),
    }
  }
}

const main = () => {
  const result = nestedTreeMock.reduce((acc, currentEntry) => {
    const { indices, total } = getCountsForAllChildren(currentEntry);
    return {
      ...indices,
      ...acc,
    }
  }, {});
  console.log('all output: ', JSON.stringify(result, null, 2));
}

main();