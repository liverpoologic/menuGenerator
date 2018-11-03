var tabList = [{
      id: 'create',
      label: 'Create',
      vtabs: [{
            id: 'addFood',
            label: 'Foods',
            icon: 'lemon',
            title: 'Add Food'
         },
         {
            id: 'addRecipe',
            label: 'Recipes',
            icon: 'book-open',
            title: 'Add Recipe'
         },
         {
            id: 'addMenu',
            label: 'Menus',
            icon: 'utensils',
            title: 'Add Menu'
         },
      ]
   },
   {
      id: 'edit',
      label: 'Edit',
      vtabs: [{
            id: 'viewMenu',
            label: 'View Menu',
            icon: 'eye',
            title: 'View Menu'
         },
         {
            id: 'editMenu',
            label: 'Edit Menu',
            icon: 'pen',
            title: 'Edit Menu'
         },
         {
            id: 'people',
            label: 'SENCO',
            icon: 'user',
            title: 'Special Dietary Requirements'
         },
         {
            id: 'shopping',
            label: 'Shopping',
            icon: 'shopping-basket',
            title: 'Shopping Lists'
         }
      ]
   },
   {
      id: 'admin',
      label: 'Admin',
      vtabs: [{
            id: 't1',
            label: 'Foods',
            icon: 'lemon',
            title: 'All Foods'
         },
         {
            id: 't2',
            label: 'Recipes',
            icon: 'book-open',
            title: 'All Recipes'
         },
         {
            id: 't3',
            label: 'Menus',
            icon: 'utensils',
            title: 'All Menus'
         },
         {
            id: 't4',
            label: 'Other',
            icon: 'wrench',
            title: 'All Enums'
         }
      ]
   },
];

module.exports = {
   tabList: tabList
};