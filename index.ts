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




const main = () => {
  const globalIndices = {};

  const addToIndices = (id: string, total: number): void => {
    globalIndices[id] = total;
  }

  const getCountsForAllChildren = (entry: IListEntry): number => {
    const { children, id: rootId } = entry;
  
    const allChildrenAmount: number = children.reduce((total: number, currentChild: IListEntry) => {
      if (currentChild.children && currentChild.children.length) {
        const childCounts: number = getCountsForAllChildren(currentChild);
        const currentPlusChildren: number = childCounts + getTaskAmountForId(currentChild.id);
        addToIndices(currentChild.id, currentPlusChildren);
        return total + currentPlusChildren;
      } else {
        const totalForCurrentEntry: number = getTaskAmountForId(currentChild.id);
        addToIndices(currentChild.id, totalForCurrentEntry);
        return total + totalForCurrentEntry;
      }
    }, 0);
  
    const rootTotal = allChildrenAmount + getTaskAmountForId(rootId);
    addToIndices(rootId, rootTotal);

    return rootTotal;
  }

  nestedTreeMock.forEach(entry => getCountsForAllChildren(entry));

  // const result = nestedTreeMock.reduce((acc, currentEntry) => {
  //   const { indices, total } = getCountsForAllChildren(currentEntry);
  //   return {
  //     ...indices,
  //     ...acc,
  //   }
  // }, {});
  console.log('all output: ', JSON.stringify(globalIndices, null, 2));
}

main();