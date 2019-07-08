## Wave Models

A simulation of several elastic body waves written in JavaScript using SVG control.

### P-wave

![P-wave Screenshot](images/PwaveScreenshot.png)

A P-wave is one of the two main types of elastic body waves, called seismic waves in seismology. P-waves travel faster than other seismic waves and hence are the first signal from an earthquake to arrive at any affected location or at a seismograph. P-waves may be transmitted through gases, liquids, or solids. 

The equation of simple P-wave is given by:

![P-wave equation](images/pwave.png)

### S-wave

![S-wave Screenshot](images/SwaveScreenshot.png)

In seismology, S-waves, secondary waves, or shear waves (sometimes called an elastic S-wave) are a type of elastic wave, and are one of the two main types of elastic body waves, so named because they move through the body of an object, unlike surface waves.

The S-wave is a transverse wave, meaning that, in the simplest situation, the oscillations of the particles of the medium is perpendicular to the direction of wave propagation, and the main restoring force comes from shear stress.

The equation of simple S-wave is given by:

![S-wave equation](images/swave.png)

### Radial P-wave

![Radial P-wave Screenshot](images/RadialPwaveScreenshot.png)

The equation of a radial P-wave is given by:

![Radial P-wave equation](images/radialpwave.png)

where *&theta;*, *r* are the polar coordinates of a point *(x<sub>0</sub>, y<sub>0</sub>)* with respect to the wave origin point *C(x<sub>c</sub>, y<sub>c</sub>)*.

### Radial S-wave

![Radial S-wave Screenshot](images/RadialSwaveScreenshot.png)

The equation of a radial S-wave is given by:

![Radial S-wave equation](images/radialswave.png)

where *&theta;*, *r* are the polar coordinates of a point *(x<sub>0</sub>, y<sub>0</sub>)* with respect to the wave origin point *C(x<sub>c</sub>, y<sub>c</sub>)*.

### Rayleigh wave

![Rayleigh Wave Screenshot](images/RayleighWaveScreenshot.png)

[Rayleigh waves](https://en.wikipedia.org/wiki/Rayleigh_wave) are a type of surface
acoustic wave that travel along the surface of solids.
There are two components in a motion of a particle disturbed by a Rayleigh wave:
horizontal and vertical that totals in movement along an ellipse.

The equation of a Rayleigh wave is given by:

![Rayleigh Wave equation](images/RayleighWaveEqAll.png)

where *&phi;* is wave phase in a point,
*%delta;* is dimensionless depth,
*d* is depth of a point *(x<sub>0</sub>, y<sub>0</sub>)* with respect to medium top level *Y*,
*h* is total medium depth,
*A<sub>x</sub>* and *A<sub>y</sub>* are horizontal and vertical
amplitudes of the Rayleigh wave respectively.

### Lamb waves

[Lamb waves](https://en.wikipedia.org/wiki/Lamb_waves)
propagate in solid plates. They are a combination of standing waves and
elastic propagational waves that, like Rayleigh waves, are constrained by
the elastic properties of the surface(s) that guide them.

There are two modes of Lamb waves: symmetrical and antisymmetric.

Their properties turned out to be quite complex. Since the 1990s,
the understanding and utilization of Lamb waves has advanced greatly, thanks
to the rapid increase in the availability of computing power. Lamb's theoretical
formulations have found substantial practical application, especially in the field
of nondestructive testing.
