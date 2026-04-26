from setuptools import setup, find_packages

setup(
    name='veridium-vnt',
    version='1.0.0',
    description='Veridium Notary Token (VNT) – offline verifiable claims',
    packages=find_packages(),
    install_requires=[
        'cryptography>=41.0.0',
        'pycryptodome>=3.19.0',
        'canonicaljson>=2.0.0',
        'multibase>=0.3.0',
        'pydantic>=2.0.0',
    ],
    python_requires='>=3.9',
    license='CC0-1.0',
)
