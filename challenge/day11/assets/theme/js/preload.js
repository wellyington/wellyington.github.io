document.addEventListener("DOMContentLoaded", () => {
  // Get elements

  const counter = document.getElementById("counter");
  const progress = document.querySelector(".progress");
  const messages = document.querySelectorAll(".message");
  const markers = document.querySelectorAll(".marker");
  const blocks = document.querySelectorAll(".block");

  // Get connector lines
  const line0to25 = document.getElementById("line-0-25");
  const line25to50 = document.getElementById("line-25-50");
  const line50to75 = document.getElementById("line-50-75");
  const line75to100 = document.getElementById("line-75-100");

  // Get grid elements
  const topRow = document.getElementById("top-row");
  const bottomRow = document.getElementById("bottom-row");
  const leftColumn = document.getElementById("left-column");
  const rightColumn = document.getElementById("right-column");

  // Create pixel grid
  createPixelGrid();

  // SplitType is now called inside completeLoading() after fonts are ready

  // Initialize counter animation
  let currentCount = 0;
  let targetCount = 0;
  let lastMessageIndex = 0;

  // Generate pixel grid
  function createPixelGrid() {
    // Generate pixels in rows and columns if needed
    // For a more minimalist approach, we're using full lines instead
  }

  // Animation function for progress
  function animateProgress() {
    const duration = 2.5; // Total loading time in seconds

    gsap.to(
      {},
      {
        duration: duration,
        onUpdate: updateProgress,
        ease: "power1.inOut"
      }
    );
  }

  // Update progress function
  function updateProgress() {
    // Calculate progress based on timeline progress
    const progress = Math.floor(this.progress() * 100);

    // Update counter target
    targetCount = progress;

    // Update UI
    updateCounter();
    updateProgressBar(progress);
    updateSystemMessages(progress);
    updateConnectorLines(progress);
    updateBlocks(progress);
    updateGridLines(progress);

    // Handle completion — auto-entra nel sito al 100% (nessun bottone)
    if (progress >= 100) {
      autoEnterSite();
    }
  }

  // Update counter with mechanical effect
  function updateCounter() {
    if (currentCount !== targetCount) {
      // Determine step size based on gap
      const gap = targetCount - currentCount;
      const step = gap > 10 ? 2 : 1;

      currentCount =
        gap > 0 ? Math.min(targetCount, currentCount + step) : targetCount;
      counter.textContent = currentCount;

      // If not at target, schedule next update
      if (currentCount !== targetCount) {
        setTimeout(updateCounter, 40);
      }
    }
  }

  // Update progress bar
  function updateProgressBar(progress) {
    document.querySelector(".progress").style.width = `${progress}%`;

    // Update marker opacity based on progress
    markers.forEach((marker) => {
      const position = parseInt(marker.getAttribute("data-position"));
      if (progress >= position) {
        marker.style.opacity = 1;
      } else {
        marker.style.opacity = 0.6;
      }
    });
  }

  // Update connector lines based on progress
  function updateConnectorLines(progress) {
    // Scale connector lines based on progress
    if (progress >= 0) {
      const scale0to25 = Math.min(1, (progress - 0) / 25);
      line0to25.style.transform = `scaleX(${scale0to25})`;
    }

    if (progress >= 25) {
      const scale25to50 = Math.min(1, (progress - 25) / 25);
      line25to50.style.transform = `scaleX(${scale25to50})`;
    }

    if (progress >= 50) {
      const scale50to75 = Math.min(1, (progress - 50) / 25);
      line50to75.style.transform = `scaleX(${scale50to75})`;
    }

    if (progress >= 75) {
      const scale75to100 = Math.min(1, (progress - 75) / 25);
      line75to100.style.transform = `scaleX(${scale75to100})`;
    }
  }

  // Update system messages based on progress
  function updateSystemMessages(progress) {
    let activeIndex = Math.min(4, Math.floor(progress / 20));

    // Only update if changed
    if (activeIndex !== lastMessageIndex) {
      // Hide all messages
      messages.forEach((message) => {
        message.classList.remove("active");
      });

      // Show current message
      messages[activeIndex].classList.add("active");

      // Simulate terminal printing effect
      if (activeIndex < messages.length) {
        simulateTyping(messages[activeIndex]);
      }

      lastMessageIndex = activeIndex;
    }
  }

  // Update blocks based on progress
  function updateBlocks(progress) {
    // Scale blocks based on progress thresholds
    if (progress >= 20) {
      blocks[0].style.transform = `scale(${Math.min(1, (progress - 20) / 20)})`;
    }

    if (progress >= 40) {
      blocks[1].style.transform = `scale(${Math.min(1, (progress - 40) / 20)})`;
    }

    if (progress >= 60) {
      blocks[2].style.transform = `scale(${Math.min(1, (progress - 60) / 20)})`;
    }

    if (progress >= 80) {
      blocks[3].style.transform = `scale(${Math.min(1, (progress - 80) / 20)})`;
    }
  }

  // Update grid lines based on progress
  function updateGridLines(progress) {
    // Extend lines based on progress
    topRow.style.width = `${progress}%`;
    bottomRow.style.width = `${progress}%`;
    leftColumn.style.height = `${progress}%`;
    rightColumn.style.height = `${progress}%`;
  }

  // Simulate typing effect for terminal-like messages
  function simulateTyping(element) {
    const text = element.textContent;
    element.textContent = "";
    element.style.display = "block";

    let i = 0;
    const typeNextChar = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeNextChar, 30);
      }
    };

    typeNextChar();
  }


let enterShown = false;
function autoEnterSite() {
  if (enterShown) return;
  enterShown = true;

  // Nascondi il contatore
  const counterWrapper = document.querySelector(".counter-wrapper");
  if (counterWrapper) {
    gsap.to(counterWrapper, { opacity: 0, duration: 0.4, ease: "power2.in" });
  }

  // Nascondi anche l'eventuale pulsante (se presente nel DOM ma non usato)
  const enterBtn = document.getElementById("enter-site-btn");
  if (enterBtn) {
    enterBtn.style.display = "none";
  }

  // Entra automaticamente nel sito (audio OFF di default:
  // l'utente potrà attivarlo cliccando il pulsante audio sul video)
  setTimeout(completeLoading, 500);
}

function completeLoading() {

  // Split text after fonts are loaded to get correct character widths and line breaks
  document.fonts.ready.then(() => {
    const contentTitle = new SplitType(".hero-text h1", { types: "words, chars" });
    const contentText = new SplitType(".hero-text p", { types: "lines" });
    runEntryAnimation(contentTitle, contentText);
  });
}

function runEntryAnimation(contentTitle, contentText) {

  const rigaLunga = document.querySelector(".riga-lunga");
  if (rigaLunga) {
    gsap.set(rigaLunga, {
      scaleX: 0,
      transformOrigin: "right",
      visibility: "visible"
    });
  }

const rigaBassa = document.querySelector(".liena-bassa");
  if (rigaBassa) {
    gsap.set(rigaBassa, {
      scaleX: 0,
      transformOrigin: "left",
      visibility: "visible"
    });
  }

const rigaIntermedia = document.querySelector(".lineea-intemedia");
  if (rigaIntermedia) {
    gsap.set(rigaIntermedia, {
      scaleX: 0,
      transformOrigin: "right",
      visibility: "visible"
    });
  }


const rigaAlta = document.querySelector(".linnea-alta");
if (rigaAlta) {
  gsap.set(rigaAlta, {
    scaleY: 0,
    transformOrigin: "top center",
    visibility: "visible"
  });
}



  const ctas = gsap.utils.toArray(".el-1, .el-2, .el-3, .el-4, .el-5, .el-6");

  gsap.set(ctas, {
    opacity: 0,
    y: 40,
    visibility: "visible",
    pointerEvents: "none"
  });




  const tl = gsap.timeline();

  tl
    .to(".preloader", {
      y: "-100%",
      duration: 0.6,
      ease: "power2.inOut"
    })

    .set(".content", { visibility: "visible" })

    // Linee partono insieme
    .addLabel("enter")

    .to(rigaAlta, {
      scaleY: 1,
      duration: 0.25,
      ease: "power2.out"
    }, "enter")

    .to(rigaBassa, {
      scaleX: 1,
      duration: 0.35,
      ease: "power2.out"
    }, "enter+=0.1")

    .to(rigaIntermedia, {
      scaleX: 1,
      duration: 0.35,
      ease: "power2.out"
    }, "enter+=0.15")

    // CTA partono in parallelo con le linee
    .to(ctas, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.12,
      ease: "power3.out",
      pointerEvents: "auto"
    }, "enter+=0.2")

    // Titolo parte subito dopo le linee
    .from(contentTitle.chars, {
      opacity: 0,
      y: 50,
      duration: 0.2,
      stagger: 0.02,
      ease: "power2.out"
    }, "enter+=0.35")

    .to(rigaLunga, {
      scaleX: 1,
      duration: 0.15,
      ease: "power2.out"
    }, "enter+=0.5")

    // Testo
    .from(contentText.lines, {
      opacity: 0,
      y: 40,
      duration: 0.3,
      stagger: 0.02,
      ease: "power2.out"
    }, "enter+=0.45");
}
  // Add pixel animation for progress indication
  function animatePixels() {
    // For minimalist approach, we're using grid lines instead
    // This function is kept for potential future enhancements
  }

  // Generate random digits for counter
  function randomDigits() {
    return Math.floor(Math.random() * 100);
  }

  // Start animations
  animateProgress();

  // Handle window resize
  window.addEventListener("resize", () => {
    // Recalculate layout if needed
  });
});