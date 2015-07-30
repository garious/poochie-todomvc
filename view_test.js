'use strict';

var view = require('./view');
var assert = require('assert');
var observable = require('poochie/observable');
var pub = observable.publisher;
var eq = assert.deepEqual;

// Test link event handlers.
(function(){
  var link = view.link('a.b.c', 'A');
  eq(link.attributes.class.get(), undefined);

  link.handlers.select();
  eq(link.attributes.class.get(), 'selected');

  link.handlers.blur();
  eq(link.attributes.class.get(), undefined);
})();

// Test double-clicking todo items.
(function(){
  var todo = view.todoItem(pub([]), {
    text: pub('foo'),
    completed: pub(false)
  });
  var readModeTodo = todo.contents[0];
  var writeModeTodo = todo.contents[1];

  // Ensure label contents is a list, not a string.
  eq(readModeTodo.contents[1].contents.get(), ['foo']);

  // Test intial state.
  eq(readModeTodo.style.display.get(), 'block');
  eq(writeModeTodo.style.display.get(), 'none');

  // Test state after double-clicking.
  readModeTodo.handlers.dblclick();
  eq(readModeTodo.style.display.get(), 'none');
  eq(writeModeTodo.style.display.get(), 'block');

  // Test state after changing the text.
  writeModeTodo.handlers.change({target: {value: 'bar'}});
  eq(readModeTodo.style.display.get(), 'block');
  eq(writeModeTodo.style.display.get(), 'none');
})();

// Test marking item as complete.
(function(){
  var todo = view.todoItem(pub([]), {
    text: pub('a'),
    completed: pub(false)
  });
  var readModeTodo = todo.contents[0];

  // Test initial state.
  var checkbox = readModeTodo.contents[0];
  eq(checkbox.attributes.checked.get(), undefined);

  // Test state after clicking.
  checkbox.handlers.click();
  eq(checkbox.attributes.checked.get(), true);

  // Test state after clicking again.
  checkbox.handlers.click();
  eq(checkbox.attributes.checked.get(), undefined);
})();

// Test todoItem class attribute.
(function(){
  var todo = view.todoItem(pub([]), {text: pub('a'), completed: pub(false)});
  eq(todo.attributes.class.get(), '');

  var todo2 = view.todoItem(pub([]), {text: pub('a'), completed: pub(true)});
  eq(todo2.attributes.class.get(), 'completed');
})();

// Test todoList.
(function(){
  var oTodoData = pub([]);
  var todoList = view.todoList(oTodoData);
  oTodoData.set([{text: pub('a'), completed: pub(false)}]);
  var todo = todoList.contents.get()[0];
  eq(todo.attributes.class.get(), '');
})();

// Test todoItemsLeftContents.
(function(){
  function itemsLeft(items) {
    var cnts = view.todoItemsLeftContents(items);
    return cnts[0].contents[0] + cnts[1];
  }

  eq(itemsLeft([]), '0 items left');
  eq(itemsLeft([pub(true)]), '0 items left');
  eq(itemsLeft([pub(false)]), '1 item left');
  eq(itemsLeft([pub(false), pub(false)]), '2 items left');
})();

// Test todoItemsLeft.
(function(){
  function itemsLeft(oItems) {
    var span = view.todoItemsLeft(oItems);
    var cnts = span.contents.get();
    return cnts[0].contents[0] + cnts[1];
  }
  var oTodoData = pub([]);
  eq(itemsLeft(oTodoData), '0 items left');

  // Add an item to the todo list and verify the contents changes.
  oTodoData.set([{completed: pub(false)}]);
  eq(itemsLeft(oTodoData), '1 item left');
})();

// Test newTodoItem.
(function(){
  var oTodoData = pub([]);
  var item = view.newTodoItem('baz', oTodoData);

  // Verify the handler is not called.
  item.handlers.keyup({keyCode: 10, target: {value: 'bar'}});
  eq(oTodoData.get().length, 0);

  // Verify the handler is called.
  item.handlers.keyup({keyCode: 13, target: {value: 'bar'}});
  eq(oTodoData.get().length, 1);

  // Verify trim both sides.
  item.handlers.keyup({keyCode: 13, target: {value: '  bar  '}});
  eq(oTodoData.get()[0].text.get(), 'bar');

  // Verify empty trimmed string ignored.
  item.handlers.keyup({keyCode: 13, target: {value: '  '}});
  eq(oTodoData.get()[0].text.get(), 'bar');
})();

// Test removeItem.
(function(){
  var oTodoData = pub([{text: pub('a'), completed: pub(false)}]);
  var todo = view.todoItem(oTodoData, oTodoData.get()[0]);
  var readModeTodo = todo.contents[0];
  var destroyButton = readModeTodo.contents[2];

  eq(oTodoData.get().length, 1);

  destroyButton.handlers.click();
  eq(oTodoData.get().length, 0);
})();

module.exports = 'passed!';

