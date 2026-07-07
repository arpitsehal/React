function customRender(reactElement, container) {

    // in this code we have to set the attributes of the element manually, but if we have a lot of props then it will be very tedious to set them manually. So we can use a loop to set the attributes of the element.
    
    /*
    const domElement = document.createElement(reactElement.type);
    domElement.innerHTML = reactElement.children;
    domElement.setAttribute('href', reactElement.props.href);
    domElement.setAttribute('target', reactElement.props.target);
    container.appendChild(domElement);
    */

    // this code is better then the above code because it will work for any type of element and any number of props
   const domElement = document.createElement(reactElement.type);
   domElement.innerHTML = reactElement.children;
   for (const prop in reactElement.props) {
       domElement.setAttribute(prop, reactElement.props[prop]);
   }
   container.appendChild(domElement);
}

const reactElement = {
    type:'a',
    props:{
        href:'https://www.google.com',
        target:'_blank',
    },
    children: "Click me to visit Google"
}
const mainContainer = document.getElementById('root');

customRender(reactElement, mainContainer);