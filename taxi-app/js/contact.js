// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('contactForm');

//     form.addEventListener('submit', (event) => {
//         event.preventDefault();

//         if (!form.checkValidity()) {
//             form.classList.add('was-validated');
//         } else {
//             enviarExito(form);
//         }
//     });
// });

// function enviarExito(form) {
//     const esIngles = form.querySelector('h1').innerText.includes('Us');
//     const mensaje = esIngles ? "Message sent successfully!" : "¡Mensaje enviado con éxito!";

//     const successDiv = document.getElementById('successMessage');
//     const successText = document.getElementById('successText');

//     // mostrar mensaje de éxito
//     successText.textContent = mensaje;
//     successDiv.classList.remove('d-none');

//     // sube la pantalla para mostrar el mensaje de éxito
//     window.scrollTo({
//         top: 0, 
//         behavior: 'smooth'
//     });
    
//     form.reset(); // vaciar
//     form.classList.remove('was-validated');
// }