#include <iostream>  // library untuk input/output
using namespace std;

int main() {
    // deklarasi variabel
    int a, b, hasil;

    // input
    cout << "Masukkan angka pertama: ";
    cin >> a;
    cout << "Masukkan angka kedua: ";
    cin >> b;

    // proses
    hasil = a + b;

    // output
    cout << "Hasil penjumlahan = " << hasil << endl;

    return 0; // program selesai
}
